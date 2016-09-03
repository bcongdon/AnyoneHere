import os
import json
from datetime import timedelta
import logging
logger = logging.getLogger(__file__)


def arp_mac_addresses():
    cmd = '''\
    arp-scan -l | \
    grep -E '([a-f0-9]{2}:){5}[a-f0-9]{2}' | awk '{print $2}' \
    '''
    logger.info("Running arp scan")
    raw = os.popen(cmd).read()
    return [x.lower() for x in raw.split()]


def offline_timedelta():
    with open('./config.json') as f:
        minutes = json.load(f).get('minutes_before_offline', 5)
    return timedelta(minutes=minutes)
