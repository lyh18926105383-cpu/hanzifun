"""Reproducible worksheets and GIFs from source-rendered images, never font guesses."""
import json, pathlib, shutil
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4, letter
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from PIL import Image

ROOT=pathlib.Path(__file__).resolve().parents[1]
CAT=json.loads((ROOT/'data/stroke-order/catalog.json').read_text())
CHAR={c['glyph']:c for c in CAT['characters']}
OUT=ROOT/'public/stroke-topic'
TEMP=ROOT/'.cache/stroke-order-2026-11-13'
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'
pdfmetrics.registerFont(TTFont('WorksheetSans',FONT))
INK='#243D35';RED='#B74432';GOLD='#DDD1BA'

def text(c,x,y,value,size=10,color=INK):
    c.setFillColor(HexColor(color));c.setFont('WorksheetSans',size);c.drawString(x,y,value)

def grid(c,x,y,size):
    c.setStrokeColor(HexColor('#BAAF9B'));c.setLineWidth(.6);c.rect(x,y,size,size)
    c.saveState();c.setDash(2,3);c.setLineWidth(.35);c.setStrokeColor(HexColor('#DAD2C5'))
    c.line(x+size/2,y,x+size/2,y+size);c.line(x,y+size/2,x+size,y+size/2)
    c.line(x,y,x+size,y+size);c.line(x+size,y,x,y+size);c.restoreState()

def image(c,file,x,y,w,h):
    im=Image.open(file);ratio=min(w/im.width,h/im.height)
    c.drawImage(ImageReader(im),x,y,width=im.width*ratio,height=im.height*ratio,mask='auto')

def header(c,w,h,subtitle,page,total):
    text(c,36,h-39,'HanziFun / WRITE A LITTLE, LEARN A LITTLE',10,RED)
    text(c,36,h-68,subtitle,22)
    text(c,36,28,'hanzifun.online/stroke-order/  |  Free practice sheet  |  '+str(page)+' / '+str(total),8)
    text(c,36,16,'Outlines: Hanzi Writer / Make Me a Hanzi - Arphic Public License. Data: cnchar 3.2.6 / CC-CEDICT.',6.7)

def make_pdf(name,pagesize):
    final=ROOT/'output/pdf'/name;final.parent.mkdir(parents=True,exist_ok=True)
    c=canvas.Canvas(str(final),pagesize=pagesize,pageCompression=1,invariant=1)
    c.setTitle('HanziFun - Eight Stroke Families and Eight Worked Characters')
    c.setAuthor('HanziFun editorial team');w,h=pagesize
    header(c,w,h,'Eight stroke families',1,5)
    text(c,36,h-91,'Trace one continuous pen movement, then try it again in an empty square.',10)
    text(c,36,h-107,'These eight learning families are distinct from the five official main shape classes.',9)
    cell=(w-72)/4
    for i,f in enumerate(CAT['basic']):
        col=i%4;row=i//4;x=36+col*cell;y=h-270-row*178
        image(c,TEMP/'pdf-images'/('single-'+f['id']+'.png'),x+12,y+26,cell-24,100)
        text(c,x+7,y+13,f['label'],11)
        text(c,x+7,y-2,f['pinyin'],10)
    text(c,36,200,'Watch. Trace. Cover the model. Write once from memory.',12)
    for row in range(2):
        for col in range(8):grid(c,36+col*(w-72)/8,65+row*56,(w-72)/8-4)
    c.showPage()
    for p in range(4):
        header(c,w,h,'Your character practice',p+2,5)
        for j,g in enumerate(CAT['examples'][p*2:p*2+2]):
            a=CHAR[g];top=h-108-j*(h-155)/2
            image(c,TEMP/'pdf-images'/('glyph-'+a['codepoint']+'.png'),36,top-72,72,72)
            text(c,123,top-20,a['pinyin']+'  /  '+str(a['strokeCount'])+' strokes',15)
            text(c,123,top-39,a['structure'],10)
            text(c,123,top-56,'Step order: '+' - '.join(map(str,a['strokeNumbers'])),8.5)
            step_width=min(62,(w-72)/a['strokeCount'])
            for step in range(1,a['strokeCount']+1):
                xpos=36+(step-1)*step_width
                image(c,TEMP/'gif-frames'/a['codepoint']/(str(step)+'.png'),xpos,top-151,step_width-3,step_width-3)
                text(c,xpos+(step_width-3)/2-2,top-163,str(step),7.5)
            text(c,36,top-180,'Follow each red stroke. Keep turns and hooks in the same pen movement.',8.5)
            size=min(55,(w-72)/8-4)
            for k in range(8):grid(c,36+k*(w-72)/8,top-245,size)
            text(c,36,top-261,'Notice one detail to improve: __________________________________________________',8.5)
        c.showPage()
    c.save();shutil.copyfile(final,OUT/name)
    print(final)

for g in CAT['examples']:
    ch=CHAR[g];d=TEMP/'gif-frames'/ch['codepoint'];frames=[Image.open(d/(str(i)+'.png')).convert('RGB') for i in range(ch['strokeCount']+1)]
    durations=[max(100,round(1800/ch['strokeCount']))]*len(frames);durations[-1]=800
    target=OUT/'gif'/(ch['codepoint']+'.gif');target.parent.mkdir(exist_ok=True)
    frames[0].save(target,save_all=True,append_images=frames[1:],duration=durations,loop=0,disposal=2,optimize=True,comment=b'Hanzi Writer 2.0.1 / Make Me a Hanzi; Arphic Public License. HanziFun. See ATTRIBUTION.txt')
make_pdf('practice-a4.pdf',A4)
make_pdf('practice-letter.pdf',letter)
