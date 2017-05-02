from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import select, func
from sqlalchemy.orm import column_property


db = SQLAlchemy()


class Measurement(db.Model):
    __tablename__ = 'measurement'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    time = db.Column(db.DateTime)


class User(db.Model):
    __tablename__ = 'user'
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120))
    mac_address = db.Column(db.String(17), unique=True)
    online = db.Column(db.Boolean, default=False)

    last_seen = column_property(
                select([func.max(Measurement.time)])
                .where(Measurement.user_id == id))
