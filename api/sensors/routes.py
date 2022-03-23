from flask import Blueprint

sensors = Blueprint('sensors', __name__, url_prefix="/network/<network_id>/probes/<probe_id>/devices/<device_id>/sensors")


@sensors.route('/', methods=['GET'])
def list_sensors(network_id, probe_id, device_id):
    # TODO -- List sensors attached to device
     return f"On network {network_id} attached to probe {probe_id}, listing sensors attached to device {device_id}"


"""
Current routes:
- Senors attached to device

Routes to add:
- Ability to add logic to sensor
"""