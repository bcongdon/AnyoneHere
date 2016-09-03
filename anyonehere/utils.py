import os
import re
import json
from datetime import timedelta
import logging
logger = logging.getLogger(__file__)

MAC_REGEX = '^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$'


def arp_mac_addresses():
    cmd = '''\
    arp-scan -l | \
    grep -E '([a-f0-9]{2}:){5}[a-f0-9]{2}' | awk '{print $2}' \
    '''
    logger.info("Running arp scan")
    raw = os.popen(cmd).read()
    mac_addrs = [x.lower() for x in raw.split()]
    if not all(map(lambda x: re.match(MAC_REGEX), mac_addrs)):
        raise RuntimeError('Invalid arp-scan output: {0}'.format(raw))
    else:
        return mac_addrs


def offline_timedelta():
    with open('./config.json') as f:
        minutes = json.load(f).get('minutes_before_offline', 5)
    return timedelta(minutes=minutes)
