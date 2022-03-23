from flask import Blueprint

network = Blueprint('network', __name__, url_prefix="/network")


@network.route('/')
def get_network_list():
    # TODO -- List all networks available 
    return "Listing all possible networks..."

@network.route('/network', methods=["POST"])
def create_network():
    # TODO -- Creates a network
    return "Creating a network..."

@network.route('/<network_id>')
def get_network(network_id):
    # TODO -- See network at a glance... 1) probes, 2) devices, 3) sensors
    return f"Requesting info for network {network_id}..."

@network.route('/<network_id>/scan_devices')
def scan_network(network_id):
    # TODO -- Scans a network for devices
    return f"Scanning network {network_id} for devices..."

"""
To be added:
- Deleting a network
"""