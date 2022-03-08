from flask import Blueprint

devices = Blueprint('devices', __name__, url_prefix="/network/<network_id>/")


@devices.route('probes/devices', methods=['GET'])
def list_devices(network_id):
    # TODO -- List all devices on all probes
    return f"List of devices for {network_id}"

@devices.route('probes/<probe_id>/devices', methods=['GET'])
def list_devices_on_probe(network_id, probe_id):
    # TODO -- List devices connected to this current probe
    return f"List of devices for {network_id} attached to probe {probe_id}"

@devices.route('probes/<probe_id>/devices/<device_id>', methods=['GET'])
def get_device(network_id, probe_id, device_id):
    # TODO -- Get a device information on this network and probe
    return f"Get device information for device {device_id} on network {network_id} and probe {probe_id}"

@devices.route('probes/<probe_id>/devices/<device_id>/login_credentials', methods=['GET'])
def login_creds(network_id, probe_id, device_id):
    # TODO -- Get login credentials for this device
    return f"List of devices for {network_id} attached to probe {probe_id}, get device {device_id} login credentials"

@devices.route('probes/<probe_id>/devices/<device_id>/attach_sensor', methods=['POST'])
def attach_sensor(network_id, probe_id, device_id):
    # TODO -- Attaches sensor to device
    return f"On network {network_id} attached to probe {probe_id}, attaching sensor to device {device_id}"

"""
Current routes:
- Lists all devices on the network
- List devices attached to probe
- Get device information
- Get login credentials
- Attach sensor to device

Routes to add:
- 
"""