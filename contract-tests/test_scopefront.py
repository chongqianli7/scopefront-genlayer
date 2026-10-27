import sys,types,unittest,importlib.util,json,copy
from pathlib import Path
class Return:
 def __init__(self,v):self.calldata=v
class Error(Exception):pass
sender=types.SimpleNamespace(sender_address='0x'+'1'*40);answers=[]
def nondet(leader,validator):
 result=leader()
 if not validator(Return(result)):raise Error('DISAGREEMENT')
 return result
host=types.SimpleNamespace(Contract=object,public=types.SimpleNamespace(write=lambda f:f,view=lambda f:f),vm=types.SimpleNamespace(UserError=Error,Return=Return,run_nondet_unsafe=nondet),message=sender,nondet=types.SimpleNamespace(exec_prompt=lambda *a,**k:answers.pop(0)))
sys.modules['genlayer']=types.SimpleNamespace(gl=host,TreeMap=dict)
spec=importlib.util.spec_from_file_location('contract',Path(__file__).parents[1]/'contracts/scopefront.py');c=importlib.util.module_from_spec(spec);spec.loader.exec_module(c)
A,B,C,D,E=['0x'+n*40 for n in '12345'];V=[B,C,D];CR=['Include website delivery.','Include editable source files.'];T=['Includes website delivery. Editable source files are excluded.','Includes website delivery and editable source files.','Includes website delivery and editable source files.']
def matrix(labels=None):
 labels=labels or [['INCLUDED','EXCLUDED'],['INCLUDED','INCLUDED'],['INCLUDED','INCLUDED']]
 return {'rows':[{'vendor':v,'cells':[{'criterion':j,'label':k,'quote':T[i],'reason':'This exact signed text supports the scope classification.'} for j,k in enumerate(labels[i])]} for i,v in enumerate(V)]}
class Tests(unittest.TestCase):
 def setUp(self):
  answers.clear();sender.sender_address=A;self.r=c.ScopeFront();self.r.open_request('web','Website','USD',json.dumps(CR),json.dumps(V))
 def load(self):return json.loads(self.r.get_request(A,'web'))
 def quotes(self):
  for i,v in enumerate(V):sender.sender_address=v;self.r.quote(A,'web',[80000,100000,120000][i],T[i])
 def compare(self,m=None):
  self.quotes();m=m or matrix();answers.extend([m,m]);self.r.compare(A,'web')
 def test_individual_vendor_signatures_immutable(self):
  sender.sender_address=E
  with self.assertRaisesRegex(Error,'NOT_QUOTING_VENDOR'):self.r.quote(A,'web',100,T[0])
  sender.sender_address=B;self.r.quote(A,'web',100,T[0])
  with self.assertRaisesRegex(Error,'IMMUTABLE'):self.r.quote(A,'web',200,T[0])
 def test_full_workflow_and_permission_gates(self):
  self.compare();r=self.load();self.assertEqual(r['frontier']['candidates'],[B,C]);sender.sender_address=A
  with self.assertRaisesRegex(Error,'NOT_FRONTIER'):self.r.select('web',D)
  self.r.select('web',C);sender.sender_address=B
  with self.assertRaisesRegex(Error,'NOT_SELECTED_VENDOR'):self.r.confirm(A,'web')
  sender.sender_address=C;self.r.confirm(A,'web');self.assertEqual(self.load()['status'],'CONFIRMED')
  with self.assertRaisesRegex(Error,'NOT_SELECTED_VENDOR'):self.r.confirm(A,'web')
 def test_incomplete_quote_matrix_cannot_compare(self):
  with self.assertRaisesRegex(Error,'INCOMPLETE'):self.r.compare(A,'web')
  self.assertEqual(self.load()['status'],'QUOTING')
 def test_validator_disagreement_preserves_state(self):
  self.quotes();answers.extend([matrix(),matrix([['EXCLUDED','EXCLUDED'],['INCLUDED','INCLUDED'],['INCLUDED','INCLUDED']])])
  with self.assertRaisesRegex(Error,'DISAGREEMENT'):self.r.compare(A,'web')
  self.assertEqual(self.load()['rows'],[])
 def test_forged_evidence_and_missing_rows(self):
  self.quotes();m=matrix();m['rows'][0]['cells'][0]['quote']='not present in this quotation';answers.append(m)
  with self.assertRaisesRegex(Error,'QUOTE'):self.r.compare(A,'web')
  with self.assertRaisesRegex(Error,'MATRIX_SIZE'):c.parse_matrix({'rows':[]},CR,[self.load()['offers'][v] for v in V])
 def test_uncertainty_excludes_and_cannot_dominate(self):
  self.compare(matrix([['INCLUDED','EXCLUDED'],['INCLUDED','UNCLEAR'],['INCLUDED','INCLUDED']]))
  f=self.load()['frontier'];self.assertEqual(f['candidates'],[B,D]);self.assertEqual(f['needs_clarification'],[C])
 def test_no_buyer_or_duplicate_vendor(self):
  sender.sender_address=A
  for vs in [[A,B],[B,B],[B,'0x'+'0'*40]]:
   with self.assertRaises(Error):self.r.open_request('bad','Bad','USD',json.dumps(CR),json.dumps(vs))
 def test_price_bounds(self):
  sender.sender_address=B
  for p in [0,-1,True,1.5,1000000001]:
   with self.assertRaisesRegex(Error,'PRICE'):self.r.quote(A,'web',p,T[0])
 def test_locked_brief_and_offer_matrix(self):
  self.compare();sender.sender_address=B
  with self.assertRaisesRegex(Error,'NOT_QUOTING_VENDOR'):self.r.quote(A,'web',1,T[0])
  with self.assertRaisesRegex(Error,'LOCKED'):self.r.compare(A,'web')
 def test_equal_quotes_both_survive(self):
  o=[{'vendor':B,'cents':100},{'vendor':C,'cents':100}];rows=[{'vendor':v,'cells':[{'label':'INCLUDED'}]} for v in [B,C]]
  self.assertEqual(c.frontier(o,rows)['candidates'],[B,C])
 def test_strict_dominance_properties_exhaustive(self):
  import itertools
  for bits in itertools.product([0,1],repeat=6):
   o=[{'vendor':str(i),'cents':[1,2,2][i]} for i in range(3)];rows=[{'vendor':str(i),'cells':[{'label':'INCLUDED' if b else 'EXCLUDED'} for b in bits[i*2:i*2+2]]}for i in range(3)]
   f=c.frontier(o,rows);self.assertGreater(len(f['candidates']),0)
   for r in f['comparisons']:
    self.assertNotIn(r['vendor'],r['dominated_by'])
    if r['vendor'] in f['candidates']:self.assertEqual(r['dominated_by'],[])
if __name__=='__main__':unittest.main()
