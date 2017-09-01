from flask import Flask, render_template, jsonify
from flask_bootstrap import Bootstrap
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


@app.route('/api/user')
def get_user():
    users = User.query.all()
    return jsonify({
        'users': [u.to_dict() for u in users]
    })


@app.route('/api/measurement')
def get_user_stats():
    measurements = Measurement.query.all()
    return jsonify({
        'measurements': [m.to_dict() for m in measurements]
    })


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


@scheduler.scheduled_job('interval', days=1)
def remove_old_data():
    log.info("Checking for old data")
    cutoff = datetime.utcnow() - discard_old_timedelta()
    old_measurements = (
        Measurement.query.filter(Measurement.time < cutoff).all()
    )
    for m in old_measurements:
        log.info('Deleting old measurement {}'.format(m.id))
        db.session.delete(m)
    db.session.commit()


@app.route('/')
def index():
    return render_template('index.html')


@app.before_first_request
def setup():
    remove_old_data()

if __name__ == '__main__':
    app.run()
