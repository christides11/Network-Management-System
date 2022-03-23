from flask import Blueprint

probes = Blueprint('probes', __name__, url_prefix="/network/")



@probes.route('<network_id>/probes', methods=['GET'])
def list_probes(network_id):
    # TODO -- List probes connected to the network
    return f"List of probes for network {network_id}"

@probes.route('<network_id>/probes/<probe_id>', methods=['GET'])
def get_probe(network_id, probe_id):
    # TODO -- Gets a probe
    return f"Getting probe {probe_id} on network {network_id}"

@probes.route('<network_id>/probes/<probe_id>/login_credentials', methods=['GET'])
def get_probe_login_credentials(network_id, probe_id):
    # TODO -- Gets a probe login credentials
    return f"Getting login credentials for probe {probe_id} on network {network_id}"







"""
Current API Routes
- List probes
- Get a specific probe
- Get login credentials attached to a probe

To add:
- Deleting a probe from the network
"""