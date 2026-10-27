import urllib.request
import json
import sys

def get_latest_tx(address):
    # Etherscan Sepolia or RPC
    url = "https://ethereum-sepolia-rpc.publicnode.com"
    req_data = {
        "jsonrpc": "2.0",
        "method": "eth_getTransactionCount",
        "params": [address, "latest"],
        "id": 1
    }
    req = urllib.request.Request(url, data=json.dumps(req_data).encode("utf-8"), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req) as resp:
        res = json.loads(resp.read().decode("utf-8"))
        print(f"Current Nonce for {address}: {int(res['result'], 16)}")

if __name__ == "__main__":
    addr = sys.argv[1] if len(sys.argv) > 1 else "0x14f10A865e277C0B1949e18Dd9856602DB11742b"
    get_latest_tx(addr)
