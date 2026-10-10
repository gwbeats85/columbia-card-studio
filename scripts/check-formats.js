async(page)=>{
  await page.goto('http://127.0.0.1:5199/?archive');await page.getByAltText('Front image original artwork').waitFor();
  const make=async(type)=>page.evaluate(async(type)=>{const image=new Image();image.src='/samples/ty-cobb-front.jpg';await image.decode();const c=document.createElement('canvas');c.width=image.width;c.height=image.height;c.getContext('2d').drawImage(image,0,0);return c.toDataURL(type).split(',')[1];},type);
  for(const type of ['image/png','image/webp']){
    const name='format-check.'+type.split('/')[1];
    await page.getByLabel('Upload front image',{exact:true}).setInputFiles({name,mimeType:type,buffer:Buffer.from(await make(type),'base64')});
    await page.getByText(name,{exact:true}).waitFor();
  }
  await page.getByLabel('Upload shop logo',{exact:true}).setInputFiles({name:'test-logo.png',mimeType:'image/png',buffer:Buffer.from(await make('image/png'),'base64')});
  await page.getByRole('button',{name:'Remove logo',exact:true}).waitFor();
  await page.getByRole('button',{name:'Remove logo',exact:true}).click();
  await page.getByRole('button',{name:'Remove front image',exact:true}).click();
  await page.getByText('Start with a card',{exact:true}).waitFor();
  await page.getByRole('button',{name:'Export',exact:true}).click();
  if(!await page.locator('.export-button').isDisabled())throw new Error('Export enabled without a front');
  await page.setViewportSize({width:390,height:844});await page.goto('http://127.0.0.1:5199/?archive');await page.getByAltText('Front image original artwork').waitFor();
  const size=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth}));
  if(size.scroll>size.width)throw new Error('Mobile horizontal overflow');
  await page.screenshot({path:'/Users/m5/Workspaces/apps/prototypes/pull-studio/proofs/narrow-ui.png',fullPage:true});
  await page.setViewportSize({width:1440,height:960});await page.goto('http://127.0.0.1:5199/?archive');
  return {formats:'PNG and WebP accepted',logo:'Upload/remove passed',empty:'Export disabled with missing front',narrow:size};
}
