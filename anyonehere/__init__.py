from flask import Flask, render_template
from flask_restless import APIManager
from flask_bootstrap import Bootstrap
from flask_socketio import SocketIO, emit
import arrow

from .models import db, User, Measurement
from .utils import arp_mac_addresses, offline_timedelta, discard_old_timedelta
from .scheduler import scheduler

from datetime import datetime
import json
import logging

logging.basicConfig(level="INFO")
log = logging.getLogger('anyonehere')

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///anyonehere.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
socketio = SocketIO(app)

# Initilizations
db.init_app(app)
Bootstrap(app)

with app.app_context():
    # Create tables
    db.create_all()

    # Load user configs
    with open('./config.json') as f:
        user_dict = json.load(f).get('users')

    # Create or update User information
    for user, mac in user_dict.items():
        user = User.query.filter_by(name=user).first() or User(name=user)
        user.mac_address = mac.lower()
        db.session.add(user)
        db.session.commit()

    manager = APIManager(app, flask_sqlalchemy_db=db)
    manager.create_api(User, methods=['GET'],
                       include_methods=['online'])
    manager.create_api(Measurement, methods=['GET'], results_per_page=0)


@scheduler.scheduled_job('interval', minutes=1)
def check_online():
    macs = arp_mac_addresses()
    with app.app_context():
        # Update users with currently 'seen' MAC addresses
        for addr in macs:
            user = User.query.filter_by(mac_address=addr).first()
            if user:
                measurement = Measurement(time=datetime.utcnow(),
                                          user_id=user.id)
                db.session.add(user)
                db.session.add(measurement)
                log.info('Adding measurement for user {}'.format(user.id))

        db.session.commit()
    emit_user_data()


@scheduler.scheduled_job('interval', days=1)
def remove_old_data():
    cutoff = datetime.utcnow() - discard_old_timedelta()
    old_measurements = Measurement.query.filter(Measurement.time < cutoff)
    for m in old_measurements:
        log.info('Deleting old measurement {}'.format(m.id))
        db.session.delete(m)
    db.session.commit()


@socketio.on('request_user_data')
def handle_request_user_data(event):
    emit_user_data()


def get_user_data():
    with app.app_context():
        user_objs = User.query.all()
        users = [{'name': x.name,
                  'online': x.last_seen > datetime.utcnow() - offline_timedelta(),
                  'last_seen': (arrow.get(x.last_seen).humanize()
                                if x.last_seen
                                else 'Unknown')}
                 for x in user_objs]
    return users


def emit_user_data():
    socketio.emit('user_data', get_user_data(), json=True)


@app.route('/')
def index():
    return render_template('index.html')


if __name__ == '__main__':
    socketio.run(app)
