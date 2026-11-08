import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(new URL('../src/lib/utils/imageFraming.ts', import.meta.url), 'utf8') + '\n' + readFileSync(new URL('../src/lib/utils/projectSlideLayout.ts', import.meta.url), 'utf8').replace(/import .* from '\.\/imageFraming'\n/, '')
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } })
const { resolveDesktopLayout, resolveMobileLayout, mobileOrientationFor } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const layout = (auto=true,orientation='portrait') => ({version:2,desktop:{mode:'center'},mobile:{auto,orientation,mode:'center'}})
const image=(span,ratio=1,key=String(span),mobileSpan=3)=>({_key:key,desktopSpan:span,mobileSpan,mediaType:'image',image:{asset:{metadata:{dimensions:{aspectRatio:ratio}}}}})
const desktop=(media,v=layout(),width=1280,height=720,gap=20)=>resolveDesktopLayout(media,width,height,gap,v)
const mobile=(media,v=layout(),stacked=true,width=390,height=844,gap=20)=>resolveMobileLayout(media,width,height,gap,stacked,v)

test('explicit desktop sizes preserve grid track widths and internal gutters',()=>{
 for(const [span,width] of [[6,307],[8,416],[10,525],[12,634],[14,743],[16,852],[18,961]]) {
  const r=desktop([image(span,2)])
  assert.equal(r.valid,true);assert.equal(r.items[0].width,width);assert.equal(r.items[0].height,width/2)
 }
 assert.equal(desktop([image(8)],layout(),1280,720,32).items[0].width,408)
 assert.equal(desktop([image(8)],layout(),1280,720,8).items[0].width,424)
})
test('desktop is width-first across viewport heights; boundary fits reserve equal gaps',()=>{
 const media=[image(16,0.25),image(8,1/3)]
 const short=desktop(media,layout(),1200,300),tall=desktop(media,layout(),1200,4000)
 assert.deepEqual(short.items,tall.items)
 assert.ok(short.items[0].height>300)
 assert.ok(Math.abs(short.items[0].width+short.items[1].width+short.gap-1200)<1e-8)
 const ovo=image(10,6900/8790)
 for(const height of [300,720,1233,1600])assert.equal(desktop([ovo],layout(),1280,height).items[0].width,525)
})
test('Auto chooses the largest whole-layout bump within twelve tracks',()=>{
 for(const [spans,expected] of [[[6],[5]],[[8],[6]],[[10],[7]],[[12],[8]],[[14],[8]],[[16],[8]],[[18],[8]],[[8,8],[6,6]],[[10,10],[6,6]],[[8,10],[5,6]],[[6,6,6],[4,4,4]],[[6,6,6,6],[3,3,3,3]],[[18,6],[8,4]]]) {
  for(const video of [false,true]) {
   const media=spans.map((s,i)=>({...image(s,0.5,String(i)),...(video?{mediaType:'video',video:{asset:{data:{aspect_ratio:'1:2'}}}}:{})}))
   const before=structuredClone(media)
   assert.deepEqual(mobile(media).spans,expected)
   assert.equal(mobile(media).valid,true)
   assert.deepEqual(media,before)
  }
 }
})
test('all valid current desktop combinations fit Auto; no fields are mutated',()=>{
 function check(spans) {
  if(spans.reduce((a,b)=>a+b,0)>24)return
  const media=spans.map((s,i)=>image(s,1.5,String(i))),before=structuredClone(media)
  assert.equal(desktop(media).valid,true)
  for(const stacked of [false,true]) {
   const r=mobile(media,layout(),stacked)
   assert.equal(r.valid,true);assert.ok(r.total<=12)
   assert.ok(r.items.every(m=>m.width<=390.00001&&m.height<=844.00001))
  }
  assert.deepEqual(media,before)
  if(spans.length<4)for(const s of [6,8,10,12,14,16,18])check([...spans,s])
 }
 for(const s of [6,8,10,12,14,16,18])check([s])
})
test('manual custom spans and orientation survive Auto without re-inference',()=>{
 const media=[image(8,0.5,'a',10)],v=layout(false,'landscape')
 assert.deepEqual(mobile(media,v,false).spans,[10])
 assert.equal(mobileOrientationFor({media,layoutV2:v}),'landscape')
 v.mobile.auto=true
 assert.deepEqual(mobile(media,v).spans,[6])
 assert.equal(mobileOrientationFor({media,layoutV2:v}),'portrait')
 assert.equal(media[0].mobileSpan,10)
})
test('retained manual overage and Justify do not invalidate active Auto',()=>{
 const media=[image(6,2,'a',8),image(6,2,'b',8)]
 for(const mode of ['center','justify']) {
  const v=layout();v.mobile.mode=mode
  assert.equal(desktop(media,v).valid,true)
  assert.deepEqual(mobile(media,v).spans,[5,5])
  v.mobile.auto=false
  assert.equal(desktop(media,v).valid,false)
  assert.deepEqual(mobile(media,v).items,[])
 }
})
test('Justified fills the viewport; manual Justify is independent of desktop',()=>{
 const media=[image(8,2)],v=layout();v.desktop.mode='justify'
 assert.equal(desktop(media,v).items[0].width,1280)
 assert.equal(desktop(media,v).items[0].height,720)
 assert.ok(Math.abs(desktop(media,v).items[0].sourceFraction-1.35)<1e-8)
 for(const stacked of [false,true]) {
  const r=mobile(media,v,stacked)
  assert.equal(r.justified,true);assert.equal(r.items[0].width,390);assert.equal(r.items[0].height,844)
 }
 v.desktop.mode='center';v.mobile.auto=false;v.mobile.mode='justify'
 assert.equal(desktop(media,v).justified,false);assert.equal(mobile(media,v).justified,true)
})
test('crop, mobile image overrides and mobile video ratios are preserved',()=>{
 const item=image(6,2);item.image.crop={left:0.25,right:0.25,top:0,bottom:0}
 assert.equal(desktop([item]).items[0].width,desktop([item]).items[0].height)
 item.mobileImage={...image(6,2).image,crop:{left:0,right:0,top:0.25,bottom:0.25}}
 assert.equal(mobile([item]).items[0].width/mobile([item]).items[0].height,4)
 const video={...image(8),mediaType:'video',video:{asset:{data:{aspect_ratio:'16:9'}}},mobileVideo:{asset:{data:{aspect_ratio:'1:2'}}}}
 assert.equal(mobile([video]).items[0].width/mobile([video]).items[0].height,0.5)
})
test('missing proportions and unmeasured viewports remain finite',()=>{
 const item={...image(6),image:undefined}
 assert.equal(desktop([item],layout(),0,NaN,NaN).ready,false)
 assert.ok(Object.values(desktop([item]).items[0]).every(Number.isFinite))
 assert.ok(desktop([item]).issues.some(i=>i.includes('missing aspect ratio')))
 const tiny=mobile([image(6)],layout(),false,50,80,200)
 assert.equal(tiny.gapAdjusted,true);assert.ok(tiny.items[0].width>0)
})
test('dormant positions and orientation cannot change valid current layout',()=>{
 const media=[image(18,2)],v=layout(),expected=[desktop(media,v),mobile(media,v)]
 const old={...media[0],desktopStart:1,desktopEnd:25,mobileStart:1,mobileEnd:13}
 assert.deepEqual([desktop([old],v),mobile([old],v)],expected)
 assert.equal(mobileOrientationFor({media:[old],layoutV2:v,mobileOrientation:'landscape'}),'portrait')
})
test('missing, unsupported and malformed layouts are unavailable without old-grid inference',()=>{
 const good=[{...image(8),desktopStart:1,desktopEnd:25,mobileStart:1,mobileEnd:13}]
 const badCases=[[good,undefined],[good,{...layout(),version:3}],[good,{version:2}],[[],layout()],[[{...good[0],mobileSpan:undefined}],layout()],[[{...good[0],desktopSpan:9}],layout()],[[{...good[0],_key:''}],layout()],[[good[0],good[0]],layout()],[[image(16,1,'a'),image(16,1,'b')],layout()]]
 for(const [media,v] of badCases) {
  const before=structuredClone([media,v])
  for(const r of [resolveDesktopLayout(media,1280,720,20,v),resolveMobileLayout(media,390,844,20,true,v)]) {
   assert.equal(r.ready,false);assert.equal(r.valid,false);assert.equal(r.justified,false)
   assert.deepEqual(r.items,[]);assert.deepEqual(r.spans,[]);assert.ok(r.issues.length)
  }
  assert.equal(mobileOrientationFor({media,layoutV2:v,mobileOrientation:'landscape'}),undefined)
  assert.deepEqual([media,v],before)
 }
})
