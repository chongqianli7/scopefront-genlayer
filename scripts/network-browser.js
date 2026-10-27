import { createClient, createAccount, generatePrivateKey } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import source from "../contracts/scopefront.py?raw";
import { success, json } from "../src/receipt.js";
import { reader, digest, verify, read } from "../src/chain.js";
const K = "scopefront-network-check-1";
let checkpoint = JSON.parse(sessionStorage.getItem(K) || "null") || {
 keys: [generatePrivateKey(), generatePrivateKey(), generatePrivateKey(), generatePrivateKey()],
 id: "web-"+Date.now(), steps: {}, address: ""
};
const accounts=checkpoint.keys.map(createAccount),clients=accounts.map(account=>createClient({chain:studionet,account}));
const owner=accounts[0].address.toLowerCase(),members=accounts.map(a=>a.address.toLowerCase());
const vendors=members.slice(1);
const criteria=['Create a responsive four-page website.','Include original editable design source files.','Include thirty days of post-launch bug fixes.'];
const terms=[
 'Fixed all-inclusive total: 800 USD. Includes a responsive four-page website. Original editable design source files are excluded. Thirty days of post-launch bug fixes are excluded.',
 'Fixed all-inclusive total: 1000 USD. Includes a responsive four-page website and original editable design source files. Thirty days of post-launch bug fixes are excluded.',
 'Fixed all-inclusive total: 1200 USD. Includes a responsive four-page website and original editable design source files. Thirty days of post-launch bug fixes are excluded.'
];
function evidence() {
  return {
    protocol: "scopefront-1",
    network: 61999,
    fullConsensus: true,
    fixture:
      "Synthetic website brief and quotations; all four test wallets controlled by one test operator, not independent businesses.",
    address: checkpoint.address,
    owner,
    id: checkpoint.id,
    sourceSha256: checkpoint.sourceSha256,
    steps: checkpoint.steps,
    record: checkpoint.record || null,
    error: checkpoint.error || null,
  };
}
function save() {
  sessionStorage.setItem(K, JSON.stringify(checkpoint));
  document.querySelector("#report").textContent = json(evidence());
}
function status(s) {
  document.querySelector("#status").textContent = s;
  save();
}
function slim(tx) {
  const receipts = tx.consensus_data?.leader_receipt;
  const ls = Array.isArray(receipts) ? receipts : [receipts];
  return {
    status: tx.status,
    statusName: tx.statusName,
    result: tx.result,
    from: tx.from_address,
    to: tx.to_address,
    contract: tx.data?.contract_address,
    leaders: ls
      .filter(Boolean)
      .map((r) => ({
        execution_result: r.execution_result,
        vote: r.vote,
        mode: r.mode,
        result:
          r.result?.status === "rollback"
            ? r.result
            : {
                status: r.result?.status,
                payload: r.result?.payload?.readable,
              },
        genvm_result: r.genvm_result,
      })),
    votes: tx.consensus_data?.votes,
  };
}
async function step(name, member, method, args, expected = true) {
  let s = checkpoint.steps[name];
  if (s?.done) return;
  status(name + ": " + (s?.hash ? "resuming receipt" : "sending once"));
  if (!s) {
    checkpoint.steps[name] = { sending: true };
    save();
    let hash;
    if (method === "deploy")
      hash = await clients[member].deployContract({
        code: source,
        args: [],
        leaderOnly: false,
      });
    else
      hash = await clients[member].writeContract({
        address: checkpoint.address,
        functionName: method,
        args,
        value: 0n,
        leaderOnly: false,
      });
    checkpoint.steps[name] = { hash, method, args, signer: members[member] };
    save();
    s = checkpoint.steps[name];
  }
  if (!s.hash)
    throw Error("Unknown send outcome at " + name + "; do not retry blindly.");
  const tx = await reader.waitForTransactionReceipt({
    hash: s.hash,
    status: "FINALIZED",
    interval: 3000,
    retries: 36,
    fullTransaction: true,
  });
  s.receipt = slim(tx);
  save();
  if (expected && !success(tx))
    throw Error(name + " did not return successful agreeing execution");
  if (!expected) {
    const leaders = s.receipt.leaders;
    if (!leaders.some((l) => l.execution_result === "ERROR"))
      throw Error(name + " was not a confirmed rejected execution");
  }
  if (method === "deploy") {
    checkpoint.address =
      tx.data?.contract_address || tx.contract_address || tx.to_address;
    await verify(checkpoint.address);
  }
  s.done = true;
  save();
}
async function run() {
  document.querySelector("#run").disabled = true;
  checkpoint.error = null;
  try {
    checkpoint.sourceSha256 = await digest(source);
    const id = checkpoint.id;
    await step("01-deploy", 0, "deploy", []);
    await step("02-open",0,"open_request",[id,"Four-page website quotations","USD",JSON.stringify(criteria),JSON.stringify(vendors)]);
    for(let i=0;i<3;i++)await step("0"+(3+i)+"-quote",i+1,"quote",[owner,id,[80000,100000,120000][i],terms[i]]);
    await step("06-compare",0,"compare",[owner,id]);
    checkpoint.record=await read(checkpoint.address,owner,id);save();
    if(checkpoint.record.frontier.candidates.join(',')!==vendors.slice(0,2).join(','))throw Error('Unexpected frontier; inspect consensus matrix.');
    await step("07-dominated-selection-denied",0,"select",[id,vendors[2]],false);
    await step("08-select",0,"select",[id,vendors[1]]);
    await step("09-wrong-vendor-denied",1,"confirm",[owner,id],false);
    await step("10-confirm",2,"confirm",[owner,id]);
    checkpoint.record=await read(checkpoint.address,owner,id);save();
    if(checkpoint.record.status!=='CONFIRMED'||checkpoint.record.selected!==vendors[1])throw Error('Final state mismatch.');
    status('VERIFIED — signed quotes, consensus coverage, enforced frontier, buyer selection and vendor confirmation.');
  } catch (err) {
    checkpoint.error = err.shortMessage || err.message || String(err);
    status("Paused: " + checkpoint.error);
  } finally {
    document.querySelector("#run").disabled = false;
    save();
  }
}
document.querySelector("#run").onclick = run;
document.querySelector("#export").onclick = () => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob([json(evidence())], { type: "application/json" }),
  );
  a.download = "scopefront-studionet.json";
  a.click();
};
save();
