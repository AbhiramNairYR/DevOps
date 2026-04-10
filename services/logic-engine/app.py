from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app) # Enable CORS for frontend requests

# Health check for Kubernetes readiness/liveness probes
@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy"}), 200

@app.route('/validate', methods=['GET'])
def validate_parts():
    cpu = request.args.get('cpu', '')
    mobo = request.args.get('mobo', '')
    gpu = request.args.get('gpu', '')
    pc_case = request.args.get('pcCase', '')

    cpu_sockets = {
        "Intel Core i3-14100": "LGA1700",
        "Intel Core i5-13600K": "LGA1700",
        "Intel Core i5-14600K": "LGA1700",
        "Intel Core i7-14700K": "LGA1700",
        "Intel Core i9-14900K": "LGA1700",
        "AMD Ryzen 3 8300G": "AM5",
        "AMD Ryzen 5 7600": "AM5",
        "AMD Ryzen 7 7800X3D": "AM5",
        "AMD Ryzen 9 7900X": "AM5",
        "AMD Ryzen 9 7950X3D": "AM5"
    }

    motherboards = {
        "ASUS PRIME B760M-A": {"socket": "LGA1700", "form_factor": "micro ATX"},
        "MSI PRO B760-P WIFI": {"socket": "LGA1700", "form_factor": "ATX"},
        "Gigabyte Z790 AORUS ELITE AX": {"socket": "LGA1700", "form_factor": "ATX"},
        "ASRock Z790M-ITX": {"socket": "LGA1700", "form_factor": "mini ATX"},
        "MSI MEG Z790 GODLIKE": {"socket": "LGA1700", "form_factor": "EATX"},
        "MSI MPG B650 CARBON WIFI": {"socket": "AM5", "form_factor": "ATX"},
        "Gigabyte B650M DS3H": {"socket": "AM5", "form_factor": "micro ATX"},
        "ASRock B650E PG-ITX": {"socket": "AM5", "form_factor": "mini ATX"},
        "ASUS ROG Crosshair X670E Hero": {"socket": "AM5", "form_factor": "ATX"},
        "ASUS ROG Crosshair X670E Extreme": {"socket": "AM5", "form_factor": "EATX"}
    }

    gpus = {
        "GeForce RTX 4060 Solo": {"fans": 1},
        "Radeon RX 6600 ITX": {"fans": 1},
        "GeForce RTX 4060 Twin": {"fans": 2},
        "Radeon RX 7600 Dual": {"fans": 2},
        "GeForce RTX 4070 SUPER Dual": {"fans": 2},
        "Radeon RX 7700 XT Dual": {"fans": 2},
        "GeForce RTX 4080 SUPER Triple": {"fans": 3},
        "GeForce RTX 4090 Triple": {"fans": 3},
        "Radeon RX 7900 XT Triple": {"fans": 3},
        "Radeon RX 7900 XTX Triple": {"fans": 3}
    }

    cases = {
        "NZXT H210": {"supported_form_factors": ["mini ATX"], "max_gpu_fans": 2},
        "Cooler Master NR200": {"supported_form_factors": ["mini ATX", "micro ATX"], "max_gpu_fans": 2},
        "Thermaltake Core V1": {"supported_form_factors": ["mini ATX"], "max_gpu_fans": 2},
        "Corsair 4000D Airflow": {"supported_form_factors": ["mini ATX", "micro ATX", "ATX"], "max_gpu_fans": 3},
        "NZXT H5 Flow": {"supported_form_factors": ["mini ATX", "micro ATX", "ATX"], "max_gpu_fans": 3},
        "Lian Li Lancool 216": {"supported_form_factors": ["mini ATX", "micro ATX", "ATX"], "max_gpu_fans": 3},
        "Fractal Pop Air": {"supported_form_factors": ["mini ATX", "micro ATX", "ATX"], "max_gpu_fans": 3},
        "Corsair 7000D Airflow": {"supported_form_factors": ["mini ATX", "micro ATX", "ATX", "EATX"], "max_gpu_fans": 3},
        "Fractal Define 7 XL": {"supported_form_factors": ["mini ATX", "micro ATX", "ATX", "EATX"], "max_gpu_fans": 3},
        "Phanteks Enthoo Pro 2": {"supported_form_factors": ["mini ATX", "micro ATX", "ATX", "EATX"], "max_gpu_fans": 3}
    }

    if not cpu or not mobo or not gpu or not pc_case:
        return jsonify({"compatible": False, "reason": "Missing CPU, Motherboard, GPU, or Case"}), 400

    if cpu not in cpu_sockets or mobo not in motherboards or gpu not in gpus or pc_case not in cases:
        return jsonify({"compatible": False, "reason": "Unknown part selected."}), 400

    cpu_socket = cpu_sockets[cpu]
    mobo_socket = motherboards[mobo]["socket"]
    mobo_form_factor = motherboards[mobo]["form_factor"]
    gpu_fans = gpus[gpu]["fans"]
    supported_form_factors = cases[pc_case]["supported_form_factors"]
    max_gpu_fans = cases[pc_case]["max_gpu_fans"]

    if cpu_socket != mobo_socket:
        return jsonify({
            "compatible": False,
            "reason": f"Socket mismatch: {cpu} ({cpu_socket}) does not match {mobo} ({mobo_socket})."
        }), 400

    if mobo_form_factor not in supported_form_factors:
        return jsonify({
            "compatible": False,
            "reason": f"Form factor mismatch: {mobo_form_factor} motherboard does not fit in {pc_case}."
        }), 400

    if gpu_fans > max_gpu_fans:
        return jsonify({
            "compatible": False,
            "reason": f"GPU size mismatch: {gpu} ({gpu_fans}-fan) is too large for {pc_case}."
        }), 400

    return jsonify({
        "compatible": True,
        "reason": "Build is compatible: socket, motherboard form factor, and GPU size all match."
    }), 200

if __name__ == '__main__':
    # Listen on all interfaces so Docker can expose it
    app.run(host='0.0.0.0', port=5000)