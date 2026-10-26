"""Extract only headword/edition/list membership facts; raw archives remain ignored.
Usage: python extract-hsk-sources.py [cache directory]
Requires pypdf for the official PDF; XLSX extraction uses Python's standard library.
"""
from pathlib import Path
import sys, re, json, zipfile, hashlib
import xml.etree.ElementTree as E
import pypdf
root = Path(__file__).resolve().parent.parent
cache = Path(sys.argv[1]) if len(sys.argv)>1 else root/'.cache/hf07'
ns={'s':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
z=zipfile.ZipFile(cache/'HSK-2015.xlsx')
strings=[''.join(e.itertext()) for e in E.fromstring(z.read('xl/sharedStrings.xml')).findall('s:si',ns)]
old=[]
for row in E.fromstring(z.read('xl/worksheets/sheet1.xml')).findall('.//s:row',ns):
    cells={}
    for c in row:
        v=c.findtext('s:v',default='',namespaces=ns)
        cells[c.get('r')[0]]=strings[int(v)] if c.get('t')=='s' else v
    if cells.get('A')=='1': old.append(dict(ordinal=len(old)+1,glyph=re.sub(r'（[^）]*）', '', cells['B']),sourceLabel=cells['B'],sourceLocator=f'xlsx:新HSK5000词:A{row.get("r")}:B{row.get("r")}'))
p=pypdf.PdfReader(cache/'hsk3.pdf'); vocab=[]; recognition=[]; writing=[]
for i in range(79,87):
    for ln,line in enumerate(p.pages[i].extract_text(extraction_mode='layout').splitlines(),1):
        m=re.match(r'^\s*(\d+)\s+(1(?:（[^）]+）)*)\s+([\u3400-\u9fff]+)([0-9]*)\s+',line)
        if m: vocab.append(dict(ordinal=int(m[1]),glyph=m[3],sourceLabel=m[3]+m[4],sourceLocator=f'pdf:page:{i+1}:line:{ln}:row:{m[1]}'))
for i,dest in [(355,recognition),(356,recognition),(376,writing)]:
    for ln,line in enumerate(p.pages[i].extract_text(extraction_mode='layout').splitlines(),1):
        for m in re.finditer(r'(\d+)\.\s*([\u3400-\u9fff])',line): dest.append(dict(ordinal=int(m[1]),glyph=m[2],sourceLocator=f'pdf:page:{i+1}:line:{ln}:row:{m[1]}'))
recognition.sort(key=lambda r:r['ordinal']); writing.sort(key=lambda r:r['ordinal'])
assert [len(x) for x in [old,vocab,recognition,writing]]==[150,300,246,100]
for rows in [old,vocab,recognition,writing]: assert [r['ordinal'] for r in rows]==list(range(1,len(rows)+1))
out=root/'data/hsk';out.mkdir(parents=True,exist_ok=True)
value=dict(hsk2=old,hsk3=dict(vocabulary=vocab,recognition=recognition,writing=writing),rawHashes={f:hashlib.sha256((cache/f).read_bytes()).hexdigest() for f in ['HSK-2015.xlsx','hsk3.pdf']})
(out/'source-headwords.json').write_text(json.dumps(value,ensure_ascii=False,separators=(',',':'))+'\n')
print('Extracted',150,300,246,100,'; writing scope is 1–2 combined, not standalone level 1')
