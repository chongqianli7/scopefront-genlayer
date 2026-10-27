import { createClient, abi } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { sha256, toBytes } from "viem";
import source from "../contracts/scopefront.py?raw";
import { addressOK, success } from "./receipt.js";
export { source };
export const reader = createClient({ chain: studionet });
export const explorer = "https://explorer-studio.genlayer.com";
export async function digest(s) {
  return sha256(toBytes(s)).slice(2);
}
export async function verify(address) {
  if (!addressOK(address)) throw Error("Enter a valid contract address.");
  if (
    (await digest(await reader.getContractCode(address))) !==
    (await digest(source))
  )
    throw Error("Deployed source differs from the bundled ScopeFront contract.");
  if (
    (await reader.readContract({
      address,
      functionName: "get_protocol",
      args: [],
      transactionHashVariant: "latest-final",
    })) !== "scopefront-1"
  )
    throw Error("Protocol mismatch.");
  return address.toLowerCase();
}
export async function connect() {
  const provider =
    window.ethereum || window.okxwallet?.ethereum || window.okxwallet;
  if (!provider?.request)
    throw Error("Open in a browser with an Ethereum-compatible wallet.");
  const accounts = await provider.request({ method: "eth_requestAccounts" });
  const owner = accounts[0]?.toLowerCase();
  if (!owner) throw Error("No account returned.");
  const w = {
    provider,
    owner,
    client: createClient({ chain: studionet, provider, account: owner }),
  };
  await check(w);
  return w;
}
export async function check(w) {
  if (!w) throw Error("Connect a wallet on Stable Studionet first.");
  const [accounts, id] = await Promise.all([
    w.provider.request({ method: "eth_accounts" }),
    w.provider.request({ method: "eth_chainId" }),
  ]);
  if (accounts[0]?.toLowerCase() !== w.owner || Number(id) !== 61999)
    throw Error("Wallet changed. Reconnect on Stable Studionet (61999).");
}
export async function read(address, owner, id) {
  if (!addressOK(owner) || !id) throw Error("Enter the request owner and ID.");
  const raw = await reader.readContract({
    address,
    functionName: "get_request",
    args: [owner, id],
    transactionHashVariant: "latest-final",
  });
  if (!raw) throw Error("Request not found.");
  const r = JSON.parse(raw);
  if (
    r.protocol !== "scopefront-1" ||
    r.owner !== owner.toLowerCase() ||
    r.id !== id
  )
    throw Error("Unexpected chain record.");
  return r;
}
export async function transaction(hash) {
  if (!/^0x[\da-f]{64}$/i.test(hash)) throw Error("Enter a transaction hash.");
  return reader.request({ method: "eth_getTransactionByHash", params: [hash] });
}
export function bind(tx, p) {
  if (
    (tx.from_address || "").toLowerCase() !== p.from ||
    (p.method !== "deploy" && (tx.to_address || "").toLowerCase() !== p.address)
  )
    throw Error("Receipt sender or contract mismatch.");
  if (p.method === "deploy") return;
  const b64 =
    typeof tx.data?.calldata === "string"
      ? tx.data.calldata
      : tx.data?.calldata?.base64;
  if (!b64) throw Error("Receipt calldata unavailable.");
  const got = abi.calldata.decode(
    Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)),
  );
  if (
    !(got instanceof Map) ||
    got.get("method") !== p.method ||
    JSON.stringify(got.get("args") || []) !== JSON.stringify(p.args)
  )
    throw Error("Receipt call does not match the pending request.");
}
export async function wait(hash) {
  return reader.waitForTransactionReceipt({
    hash,
    status: "FINALIZED",
    interval: 3000,
    retries: 12,
    fullTransaction: true,
  });
}
