from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import select, func
from sqlalchemy.orm import column_property
from utils import offline_timedelta
from datetime import datetime


db = SQLAlchemy()


class Measurement(db.Model):
    __tablename__ = 'measurement'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    time = db.Column(db.DateTime)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'time': self.time
        }


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    mac_address = db.Column(db.String(17), unique=True)

    last_seen = column_property(
                select([func.max(Measurement.time)])
                .where(Measurement.user_id == id))

    @property
    def online(self):
        cutoff = datetime.utcnow() - offline_timedelta()
        return self.last_seen and self.last_seen > cutoff

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'mac_address': self.mac_address,
            'last_seen': self.last_seen,
            'online': self.online
        }
