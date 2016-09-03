from flask import Flask, render_template
from flask_restless import APIManager
from flask_bootstrap import Bootstrap

from .models import db, User
from .utils import arp_mac_addresses, offline_timedelta
from .scheduler import scheduler

from datetime import datetime
import json
import logging

logging.basicConfig(level="INFO")

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///anyonehere.db'

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

manager.create_api(User, methods=['GET'])


@scheduler.scheduled_job('interval', minutes=1, start_date=datetime.now())
def check_online():
    macs = arp_mac_addresses()
    with app.app_context():
        # Update users with currently 'seen' MAC addresses
        for addr in macs:
            user = User.query.filter_by(mac_address=addr).first()
            if user:
                user.online = True
                user.last_seen = datetime.now()
                db.session.add(user)
        for user in User.query.filter(User.mac_address.notin_(macs)).all():
            if (not user.last_seen or
                    datetime.now() - user.last_seen > offline_timedelta()):
                user.online = False
                db.session.add(user)
        db.session.commit()

@app.route('/')
def index():
    user_objs = User.query.all()
    users = [{'name': x.name,
              'online': x.online,
              'last_seen': (x.last_seen.strftime('%I:%M%p %Y-%m-%d')
                            if x.last_seen
                            else 'Unknown')}
             for x in user_objs]
    return render_template('index.html', users=users,
                           num_online=sum(1 for x in users if x['online']))


if __name__ == '__main__':
    app.run(debug=True)
