import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import ts from 'typescript'

const source = readFileSync(new URL('../src/lib/utils/imageFraming.ts', import.meta.url), 'utf8') + '\n' + readFileSync(new URL('../src/lib/utils/projectSlideLayout.ts', import.meta.url), 'utf8').replace(/import .* from '\.\/imageFraming'\n/, '')
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } })
const { desktopSpan, centeredSize, resolveDesktopLayout, resolveMobileLayout, mobileOrientationFor } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const image = (span, ratio = 1) => ({ _key: String(span), desktopStart: 1, desktopEnd: span + 1, mediaType: 'image', image: { asset: { metadata: { dimensions: { aspectRatio: ratio } } } } })

test('legacy mapping and valid sizes', () => {
  for (const [stored, expected] of [[4,6],[6,6],[8,8],[9,8],[10,10],[12,12],[14,14],[16,16],[18,16]]) assert.equal(centeredSize(stored), expected)
  for (const [start,end] of [[undefined,10],[10,10],[0,25],[1,26],[1,3.5]]) assert.equal(desktopSpan(start,end),8)
})
test('centered dimensions preserve source shape and requested width', () => {
  const result = resolveDesktopLayout([image(4,2)],1200,800,20)
  assert.deepEqual(result.items[0], { width:287,height:143.5,sourceFraction:0.287 })
  assert.equal(result.justified,false)
})
test('width fitting reserves gaps and preserves unequal requested widths', () => {
  const {items,gap} = resolveDesktopLayout([image(16,2),image(8,1)],1200,800,20)
  assert.ok(Math.abs(items[0].width + items[1].width + gap - 1200)<1e-8)
  assert.ok(Math.abs(items[0].width/items[1].width - 2396/1168)<1e-8)
})
test('desktop sizing is independent of height for tall images, videos and diptychs', () => {
  const ovo = image(10, 6900/8790)
  for (const height of [300,720,1233,1600]) {
    const result = resolveDesktopLayout([ovo],2560,height,20)
    assert.ok(Math.abs(result.items[0].width - 1058.3333333333)<1e-8)
    assert.ok(Math.abs(result.items[0].height - 1058.3333333333333*8790/6900)<1e-8)
    assert.equal(result.scale,1)
    assert.equal(result.fitReason,null)
  }
  assert.equal(resolveDesktopLayout([ovo],1280,720,20).items[0].width,525)
  const video = {...image(8),mediaType:'video',video:{asset:{data:{aspect_ratio:'1:3'}}}}
  const media = [image(16,0.25),video]
  const short = resolveDesktopLayout(media,1200,300,20)
  const tall = resolveDesktopLayout(media,1200,4000,20)
  assert.deepEqual(short.items,tall.items)
  assert.equal(short.fitReason,'boundary')
  assert.ok(short.items[0].height>300)
  assert.ok(Math.abs(short.items[0].width+short.items[1].width+short.gap-1200)<1e-8)
  assert.equal(short.items[1].width/short.items[1].height,1/3)
})
test('one full span covers both dimensions; full span in a group stays contained', () => {
  const full = resolveDesktopLayout([image(24,2)],1200,900,20)
  assert.equal(full.justified,true)
  assert.equal(full.items[0].width,1200)
  assert.equal(full.items[0].height,900)
  assert.ok(Math.abs(full.items[0].sourceFraction-1.8)<1e-8)
  assert.equal(resolveDesktopLayout([image(24),image(6)],1200,900,20).justified,false)
})
test('three/four media fit without mutation, and video ratio is honored', () => {
  for(const count of [3,4]) {
    const media=Array.from({length:count},()=>image(16,2)); const before=structuredClone(media)
    const {items,gap}=resolveDesktopLayout(media,1024,768,20)
    assert.ok(Math.abs(items.reduce((n,m)=>n+m.width,0)+(count-1)*gap-1024)<1e-8)
    assert.deepEqual(media,before)
  }
  const video={...image(6),mediaType:'video',video:{asset:{data:{aspect_ratio:'16:9'}}}}
  const {items}=resolveDesktopLayout([video],1200,800,20)
  assert.equal(items[0].width/items[0].height,16/9)
})
test('missing metadata, empty slides and unmeasured containers remain finite', () => {
  assert.deepEqual(resolveDesktopLayout([],0,0,20).items,[])
  const result=resolveDesktopLayout([{...image(6),image:undefined}],0,NaN,NaN)
  assert.equal(result.ready,false)
  assert.ok(Object.values(result.items[0]).every(Number.isFinite))
})


test('sizes retain the existing 24-column grid track and gutter widths', () => {
  // Legacy CSS: 1288px container, 23 * 20px gutters => 34.5px tracks.
  for (const [span, width] of [[6,307],[8,416],[10,525],[12,634],[14,743],[16,852]]) {
    const result = resolveDesktopLayout([image(span,2)],1280,1000,20)
    assert.equal(result.items[0].width,width)
    assert.equal(result.items[0].height,width/2)
  }
  assert.notEqual(resolveDesktopLayout([image(8,2)],1280,1000,20).items[0].width,1280/3)
  const pair = resolveDesktopLayout([image(8,2),image(8,2)],1280,1000,20)
  assert.deepEqual(pair.items.map(item=>item.width),[416,416])
})

test('grid gutter changes affect column spans even for a single item', () => {
  assert.equal(resolveDesktopLayout([image(8,2)],1280,1000,32).items[0].width,408)
  assert.equal(resolveDesktopLayout([image(8,2)],1280,1000,8).items[0].width,424)
})

const mobileImage = (span, ratio = 1) => ({...image(8, ratio), mobileStart: 1, mobileEnd: span + 1})
test('mobile uses twelve tracks and ignores absolute positions without mutating content', () => {
  const media = [mobileImage(4, 2), {...mobileImage(6, 2), mobileStart: 5, mobileEnd: 11}]
  const before = structuredClone(media)
  const result = resolveMobileLayout(media, 390, 844, 20, false)
  // 398px reference minus eleven 20px gutters gives 14.8333px tracks.
  assert.ok(Math.abs(result.items[0].width - (4 * 178 / 12 + 60)) < 1e-8)
  assert.ok(Math.abs(result.items[1].width - 189) < 1e-8)
  assert.deepEqual(media, before)
})
test('stacked mobile layouts preserve relative row spans and fit both axes', () => {
  const {items, gap} = resolveMobileLayout([mobileImage(7, 0.5), mobileImage(5, 0.5)], 390, 844, 20, true)
  assert.ok(Math.abs(items[0].height + items[1].height + gap - 844) < 1e-8)
  assert.equal(items[0].width / items[0].height, 0.5)
  assert.ok(items.every(item => item.width <= 390))
})
test('mobile replacement proportions and single full-span cover are honored', () => {
  const item = mobileImage(8, 2)
  item.mobileImage = image(8, 0.5).image
  const result = resolveMobileLayout([item], 390, 844, 20, false)
  assert.equal(result.items[0].width / result.items[0].height, 0.5)
  for (const stacked of [false, true]) {
    const full = resolveMobileLayout([mobileImage(12)], 390, 844, 20, stacked)
    assert.equal(full.justified, true)
    assert.equal(full.items[0].width, 390)
    assert.equal(full.items[0].height, 844)
  }
  assert.equal(resolveMobileLayout([mobileImage(12),mobileImage(4)],390,844,20,true).justified,false)
})

test('Auto mobile halves consolidated desktop sizes and preserves source documents', () => {
  for (const [stored, expected] of [[4,3],[6,3],[8,4],[9,4],[10,5],[12,6],[14,7],[16,8],[18,8]]) {
    const item = {...image(stored, 0.5), mobileStart: 3, mobileEnd: 11}
    const before = structuredClone(item)
    const result = resolveMobileLayout([item],390,844,20,true)
    assert.equal(result.mode,'auto')
    assert.deepEqual(result.spans,[expected])
    assert.deepEqual(item,before)
  }
  const full = resolveMobileLayout([{...image(24),mobileStart:3,mobileEnd:11}],390,844,20,true)
  assert.equal(full.justified,true)
})
test('all valid desktop combinations remain within twelve Auto mobile tracks', () => {
  const sizes=[6,8,10,12,14,16]
  const check = spans => {
    if(spans.reduce((a,b)=>a+b,0)>24) return
    const media=spans.map(span=>image(span))
    const result=resolveMobileLayout(media,390,844,20,false)
    assert.equal(result.mode,'auto')
    assert.equal(result.valid,true)
    assert.ok(result.total<=12)
    if(spans.length<4) for(const size of sizes) check([...spans,size])
  }
  for(const size of sizes) check([size])
})
test('legacy over-budget content remains invalid after compatibility fitting', () => {
  const media=[image(16),image(16)]
  const desktop=resolveDesktopLayout(media,1280,720,20)
  const mobile=resolveMobileLayout(media,390,844,20,false)
  assert.equal(desktop.valid,false)
  assert.equal(mobile.valid,false)
  assert.equal(mobile.fitReason,'legacy-compatibility')
  assert.ok(mobile.items.reduce((sum,item)=>sum+item.width,0)+mobile.gap<=390.00001)
})
test('custom and partial mobile fields are not mistaken for Auto defaults', () => {
  assert.equal(resolveMobileLayout([mobileImage(10)],390,844,20,false).mode,'custom')
  const partial={...image(8),mobileStart:1}
  const result=resolveMobileLayout([partial],390,844,20,false)
  assert.equal(result.mode,'custom')
  assert.equal(result.valid,false)
  const tiny=resolveMobileLayout([mobileImage(4)],50,80,200,false)
  assert.equal(tiny.gapAdjusted,true)
  assert.ok(tiny.items[0].width>0)
})

test('explicit V2 spans and modes override legacy fields without re-inferring Auto', () => {
  const media = [{...image(4, 0.5),desktopSpan:10,mobileSpan:8}]
  const v = {version:2,desktop:{mode:'center'},mobile:{auto:false,mode:'center',orientation:'portrait'}}
  assert.deepEqual(resolveDesktopLayout(media,1280,720,20,v).spans,[10])
  const manual = resolveMobileLayout(media,390,844,20,true,v)
  assert.equal(manual.mode,'custom')
  assert.deepEqual(manual.spans,[8])
  const auto = resolveMobileLayout(media,390,844,20,true,{...v,mobile:{...v.mobile,auto:true}})
  assert.deepEqual(auto.spans,[6])
  const cover = resolveDesktopLayout(media,1280,720,20,{...v,desktop:{mode:'justify'}})
  assert.equal(cover.justified,true)
})
test('incomplete or unsupported V2 falls back as a whole and reports the issue', () => {
  const media=[{...image(8,2),desktopSpan:16}]
  const v={version:2,desktop:{mode:'center'},mobile:{auto:false,mode:'center',orientation:'portrait'}}
  const result=resolveDesktopLayout(media,1280,720,20,v)
  assert.deepEqual(result.spans,[8])
  assert.equal(result.valid,false)
  assert.ok(result.issues.some(issue=>issue.includes('Invalid V2')))
  assert.equal(resolveMobileLayout(media,390,844,20,false,{...v,version:3}).valid,false)
})

test('Auto uses desktop halves despite retained manual overage or Justify', () => {
  const media = ['a','b'].map(_key => ({...image(16,2),_key,desktopSpan:6,mobileSpan:8}))
  for (const mode of ['center','justify']) {
    const v = {version:2,desktop:{mode:'center'},mobile:{auto:true,mode,orientation:'portrait'}}
    const before = JSON.stringify([media,v])
    const desktop = resolveDesktopLayout(media,1280,720,20,v)
    assert.equal(desktop.valid,true)
    assert.deepEqual(desktop.spans,[6,6])
    assert.deepEqual(desktop.items.map(m=>m.width),[307,307])
    for (const stacked of [true,false]) {
      const mobile = resolveMobileLayout(media,390,844,20,stacked,v)
      assert.equal(mobile.valid,true)
      assert.equal(mobile.mode,'auto')
      assert.equal(mobile.justified,false)
      assert.deepEqual(mobile.spans,[3,3])
    }
    assert.equal(JSON.stringify([media,v]),before)
    const manual = {...v,mobile:{...v.mobile,auto:false}}
    assert.equal(resolveDesktopLayout(media,1280,720,20,manual).valid,false)
    assert.equal(resolveMobileLayout(media,390,844,20,true,manual).valid,false)
  }
})

 test('cropped images use their cropped aspect ratio for desktop and mobile layout', () => {
 const item = {...image(6,2),crop:undefined}; item.image.crop={left:0.25,right:0.25,top:0,bottom:0};
 const desktop=resolveDesktopLayout([item],1280,720,20);
 assert.equal(desktop.items[0].width, desktop.items[0].height);
 item.mobileImage={...image(6,2).image,crop:{left:0,right:0,top:0.25,bottom:0.25}};
 const mobile=resolveMobileLayout([item],390,844,20,true);
 assert.equal(mobile.items[0].width/mobile.items[0].height,4);
 })

test('XXXL uses 18 desktop columns and maps to mobile XXL in both orientations', () => {
  const media = [{...image(8,2),desktopSpan:18,mobileSpan:5}]
  const v = {version:2,desktop:{mode:'center'},mobile:{auto:true,mode:'center',orientation:'portrait'}}
  const before = JSON.stringify([media,v])
  const desktop = resolveDesktopLayout(media,1280,720,20,v)
  assert.equal(desktop.valid,true)
  assert.deepEqual(desktop.spans,[18])
  assert.equal(desktop.items[0].width,961)
  for (const stacked of [false,true]) {
    const mobile = resolveMobileLayout(media,390,844,20,stacked,v)
    assert.equal(mobile.valid,true)
    assert.deepEqual(mobile.spans,[8])
    const manual = resolveMobileLayout(media,390,844,20,stacked,{...v,mobile:{...v.mobile,auto:false}})
    assert.deepEqual(manual.spans,[5])
    const pair = [...media,{...image(6,2),desktopSpan:6,mobileSpan:3}]
    assert.equal(resolveDesktopLayout(pair,1280,720,20,v).valid,true)
    const pairedMobile = resolveMobileLayout(pair,390,844,20,stacked,v)
    assert.equal(pairedMobile.valid,true)
    assert.deepEqual(pairedMobile.spans,[8,3])
    pair[1].desktopSpan=8
    assert.equal(resolveDesktopLayout(pair,1280,720,20,v).valid,false)
    assert.equal(resolveMobileLayout(pair,390,844,20,stacked,v).valid,false)
  }
  assert.equal(JSON.stringify([media,v]),before)
  assert.deepEqual(resolveDesktopLayout([image(18)],1280,720,20).spans,[16])
  assert.equal(centeredSize(20),16)
})


test('Auto mobile uses portrait even for saved landscape; manual orientation remains selectable', () => {
  const slide = {media:[{...image(8),desktopSpan:8,mobileSpan:4}],mobileOrientation:'landscape',layoutV2:{version:2,desktop:{mode:'center'},mobile:{auto:true,mode:'center',orientation:'landscape'}}}
  const before = JSON.stringify(slide)
  assert.equal(mobileOrientationFor(slide),'portrait')
  assert.equal(JSON.stringify(slide),before)
  slide.layoutV2.mobile.auto = false
  assert.equal(mobileOrientationFor(slide),'landscape')
  slide.layoutV2.mobile.orientation = 'portrait'
  assert.equal(mobileOrientationFor(slide),'portrait')
})


test('single-image Auto increases one mobile size, capped at eight; other layouts stay unchanged', () => {
  const v={version:2,desktop:{mode:'center'},mobile:{auto:true,mode:'center',orientation:'portrait'}}
  for (const [desktopSpan,expected] of [[6,4],[8,5],[10,6],[12,7],[14,8],[16,8],[18,8]]) {
    const media=[{...image(8),desktopSpan,mobileSpan:3}]
    const before=JSON.stringify(media)
    const auto=resolveMobileLayout(media,390,844,20,true,v)
    assert.deepEqual(auto.spans,[expected])
    assert.equal(auto.valid,true)
    assert.deepEqual(resolveDesktopLayout(media,1280,720,20,v).spans,[desktopSpan])
    const manual={...v,mobile:{...v.mobile,auto:false}}
    assert.deepEqual(resolveMobileLayout(media,390,844,20,true,manual).spans,[3])
    const justified={...v,desktop:{mode:'justify'}}
    const cover=resolveMobileLayout(media,390,844,20,true,justified)
    assert.equal(cover.justified,true)
    assert.equal(cover.items[0].width,390)
    assert.equal(cover.items[0].height,844)
    const video=[{...media[0],mediaType:'video',video:{asset:{data:{aspect_ratio:'1:1'}}}}]
    assert.deepEqual(resolveMobileLayout(video,390,844,20,true,v).spans,[Math.min(8,desktopSpan/2)])
    const pair=[...media,{...image(6),_key:'second',desktopSpan:6,mobileSpan:3}]
    assert.deepEqual(resolveMobileLayout(pair,390,844,20,true,v).spans,[Math.min(8,desktopSpan/2),3])
    assert.equal(JSON.stringify(media),before)
  }
})
