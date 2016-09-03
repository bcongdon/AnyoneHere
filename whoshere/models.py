from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    name = db.Column(db.String(120), primary_key=True)
    mac_address = db.Column(db.String(17), unique=True)
    last_seen = db.Column(db.DateTime)
    online = db.Column(db.Boolean, default=False)
