@require https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js 
@require     https://unpkg.com/idb-keyval@6.0.3/dist/umd.js

alert("1111");
let nameUpdated = false;
let titleDiv = null;
let buttonStyle = ''
let html = `<br><p style="display: inline-block;color:#666; font-size : 11px"><a id='downloadLink' href='' style="display:none">download</a> 
						<button ${buttonStyle} id=downloadButton style="display:none"> download </button>
						<button ${buttonStyle} id=downloadServerButton style="display:none"> download Server</button>
						<br><input type=number id=mins></input>
						<button ${buttonStyle} id=hideLess>!<</button>
						<button ${buttonStyle}  id=hideGreater>!></button>
						<button ${buttonStyle}  id=hidePrivate>!private</button>
						<button ${buttonStyle}  id=hideFiltered> !filtered </button>
						<button ${buttonStyle}  id=addToSeen> add page </button>
						<button ${buttonStyle}  id=unhidePage> unhide Page </button>
						<button ${buttonStyle}  id=performAll> performAll </button>
						<br><input type=text size=80 id=notWanted></input> 
						<button class='ad_button' ${buttonStyle}  id=removeNotWanted>!unwanted</button>
						<br><textarea  type=text size=80 id=wanted></textarea> 
						<button ${buttonStyle}  id=rearrangeWanted> wanted</button>
						<button ${buttonStyle}  id=hideAndRearrange>hide and arrange</button>
						</p/>`;

// adjust videos page

$(document).on('keydown keyup keypress', function (event, characterCode) {
    if ((event.key === 'a' || event.key === 'A') && event.type === 'keypress') {
        $('#hideAndRearrange')[0].click();
      	console.log('arranged');
    }
    if ((event.key === 'z' || event.key === 'Z') && event.type === 'keypress') {
        $('#addToSeen')[0].click();
        console.log('added to seen');
    }
    if ((event.key === 'q' || event.key === 'Q') && event.type === 'keypress') {
        $('#hideLess')[0].click();
        console.log('added to seen');
    }
  
  	if ((event.key === 'd' || event.key === 'D') && event.type === 'keypress') {
        $('#downloadServerButton')[0].click();
        console.log('download');
    }
});


document.getElementById('hideLess').onclick = ()=> hideLimit(document.getElementById('mins').value,'less');
document.getElementById('hideGreater').onclick = ()=> hideLimit(document.getElementById('mins').value,'more');
document.getElementById('hidePrivate').onclick = ()=> hidePrivate();
document.getElementById('hideFiltered').onclick = ()=> hideFiltered();
document.getElementById('addToSeen').onclick = ()=> addFiltered();
document.getElementById('unhidePage').onclick = ()=> unhidePage();
document.getElementById('performAll').onclick = ()=> performAll();
document.getElementById('downloadButton').onclick = ()=> copyAndDownload(); 
document.getElementById('downloadServerButton').onclick = ()=> sendToDownloadServer(); 
document.getElementById('removeNotWanted').onclick = ()=> removeNotWanted(document.getElementById('notWanted').value);
document.getElementById('rearrangeWanted').onclick = ()=> rearrangeWanted(document.getElementById('wanted').value);
document.getElementById('hideAndRearrange').onclick = ()=> hideAndRearrange(); 


//videos:
//$('.similar .video-item')




function hideLimit(limit,direction){
  limit = parseInt(limit);
  setLimit(limit);
  let vids = getVideos();
	for(let i = 0 ; i < vids.length; i++){
    let vid = vids[i];
    if(!vid.innerText.includes('m')) continue;
    
  	let minsItem = vid.innerText.replace('m','');
    if(minsItem.includes('\n')){
    	minsItem = vid.getElementsByClassName('l')[0].innerText.replace('m','');
    }
    minsItem = parseInt(minsItem);
    if((direction == 'less' && minsItem < limit) || (direction == 'more' && minsItem > limit)){
      if(document.location.href.includes('/video/')){
     		vid.style.display = 'none';

      }
      else{
        vid.style.display = 'none';
      }
    	
    }
  }
}


function hidePrivate(){
  alert('not done yet');
  //document.querySelectorAll('.private').forEach(x => x.style.display = 'none');
}

function hideFiltered(callback){
  get('filteredVids',store).then((filtered) => {
    let seen = new Set();
    getVideos().forEach(vid => {
      let link = ""
      if(window.location.href.indexOf("https://spankbang.com/users/social") > -1){
      	 link = vid?.querySelectorAll('a')[1]?.href;
      }
      else{
      	link = vid?.querySelector('a')?.href;
      }
    	if(filtered[link]){                  
      	vid.style.display = 'none';
      }
      else if(seen.has(link)){
      	vid.style.display = 'none';
      }
      else{
         seen.add(link);
      }
    });
    if(callback) callback();
  });
	
}
         
function addFiltered(){
  get('filteredVids',store).then(filtered => {
    try{
      if(!filtered) filtered = {};
      getVideos().forEach(vid => {
                  
        if(vid.style.display != 'none'){
            if(window.location.href.indexOf("https://spankbang.com/users/social") > -1){
               filtered[vid?.querySelectorAll('a')[1]?.href] = true;
            }
            else{
              filtered[vid?.querySelector('a')?.href] = true;
            }      
          
        }
      });
      set('filteredVids',filtered,store);
    }
    catch(e){
    	console.error(e);
    }
  });	
}

function unhidePage(){
	get('filteredVids',store).then(filtered => {
    if(!filtered) filtered = {};
    getVideos().forEach(vid => {
      //console.log(vid);
			vid.style.display = 'block'
      delete filtered[vid?.querySelector('a')?.href];
    });
    set('filteredVids',filtered,store);
  });	
}

function performAll(){
  hideLimit(document.getElementById('mins').value,'less');
  //hidePrivate();
  GM.setClipboard (title);

  hideFiltered(addFiltered);
  if(document.location.href.includes('/video/')){
  	document.getElementById('downloadLink').click();
  }
  
}

function setLimit(limit){
	set('limit', limit, store);
}
                  
function setUnwanted(tokens){
	set('unwanted', tokens, store);
}

function setWanted(tokens){
	set('wanted', tokens, store);
}

function copyAndDownload(){
	GM.setClipboard (title);
  document.getElementById('downloadLink').click();

}

function cleanTitle(title){
	return title.replace(/[^a-z^A-Z^0-9^ \\:_\-\\\/\(\)\!']/g,'_');
}

function getVideos(){
	if(document.location.href.includes('/video/')){
     let similars = Array.from($('.similar .video-item'));
     similars = similars.length ? similars : Array.from($('.main_results .video-item'));
     return  similars ;
  }
  else if(document.location.href.includes('/users/social')){
     return Array.from($('.video-list .video-item[id]'));
  }
  else if(document.location.href.includes('/profile/')){
  	return Array.from($('.video-list:eq(1) .video-item'));
  }
  else if(document.location.href.includes('/playlist/')){
     return Array.from($('.video-list:eq(1) .video-item'))
  }
  else if(document.location.href.includes('/playlists_subs')){
     return Array.from($('.video-list .video-item[id]'));
  }
                  
  return Array.from($('.video-list:eq(1) .video-item'))
}
         
         

function removeNotWanted(unwantedArr,callback){
  setUnwanted(unwantedArr);
  let arr = unwantedArr.split(';');
	getVideos().forEach(vid => {
      arr.map(unwanted1 => {
        if(vid?.innerText?.toLowerCase().includes(unwanted1.toLowerCase())){
           vid.style.display = 'none';
        }
      });
	
    });
    if(callback) callback();
}

function sortVidsLength(videos){
	return videos.sort((a,b)=>{
     if(!a?.getElementsByClassName || !a?.getElementsByClassName('l').length) return -1;
     if(!b?.getElementsByClassName || !b?.getElementsByClassName('l').length) return 1;
     return Number(b.getElementsByClassName('l')?.[0]?.innerText.replace(/[a-z]/,'')) - Number(a?.getElementsByClassName('l')?.[0].innerText.replace(/[a-z]/,''));
  }).map(v => {
      v.parentNode.appendChild(v);
      return v;
   });
}
           
function rearrangeWanted(wantedArr,callback){
  setWanted(wantedArr)
  let arr = wantedArr.split(';');
  let regexWanted = new RegExp(arr.join('|'),'gi');
	let vids = sortVidsLength(getVideos());
    vids.forEach(vid => {
        let doesVidHaveWanted = arr.some(wanted1 => vid?.innerText?.toLowerCase().includes(wanted1.toLowerCase()));
        // if it does not contain wanted text, move it to be the last child. it should keep the sort but bring the wanted ones on top as they will not be pushed to the end
        if(!doesVidHaveWanted){
             vid.parentNode.appendChild(vid);
          }
        else{
          vid.style.border = "3px dotted  #0000FF";
           vid.getElementsByTagName('a')[1].innerHTML = vid.getElementsByTagName('a')[1].innerText.replace(regexWanted, '<span style="background:blueviolet">$&</span>');
           vid.getElementsByTagName('a')[1].style.display = 'grid';
           
       }
      
    });
    if(callback) callback();
}
         
function hideAndRearrange(){
  //hideLimit(document.getElementById('mins').value,'less');
  hideFiltered(()=>{
      removeNotWanted(document.getElementById('notWanted').value,()=>{
      	rearrangeWanted(document.getElementById('wanted').value);
      });
  });
  
}
                  
function sendToDownloadServer(){
  const title2 = title.replace('/','');
  const link = btoa(document.getElementById('downloadLink').href);
  console.log(title2,link);
	fetch('http://localhost:3000/?title='+title2+'&linkToDownload='+link).then((d)=>d.text() )
    .then(d=>{
    		document.getElementById('downloadServerButton').innerText = d;
        //window.close();
  		});

}
                  
window.addEventListener('visibilitychange', () => {
   get('limit',store).then((val) => document.getElementById('mins').value = val);
   get('unwanted',store).then((val) => document.getElementById('notWanted').value = val);
                  
});

function changeVideoLinksFromPlaylist(){
  //$('.sp')[0].remove();
  Array.from($('.video-list:eq(1) .video-item')).map(vidItem => {
    let links = Array.from($(vidItem).find('a'));
    if(!links[0]) {console.log("empty links");return;};
           console.log(links[0].href);
    fetch(links[0].href).then(d=> d.text()).then(d => {
      const parser = new DOMParser();
      const htmlDocument = parser.parseFromString(d, 'text/html');
      // Find the element with attribute [property='og:url']
      const element = htmlDocument.querySelector("[property='og:url']");
      links[0].href = element.content;
      links[1].href = element.content;
     	
    });
 	});
}


                  

                  
/*
Array.from($('.video-list .video-item .t .l')).filter(y => y?.parentElement?.parentElement?.parentElement.id).filter(x => x.innerText.replace('m','') - 1 < 10).map(y => y?.parentElement?.parentElement?.parentElement.style.setProperty('display','none'))

Array.from($('.video-list div a.n'))
.filter(x => x.parentElement.style.display !== "none")
.map(x => {
	x.setAttribute('target',x.href);
	x.click();
})

*/
           

function autoClickDownload(){
  if(document.location.href.includes("?dontDownload") === false){
     setTimeout(()=>{
  	  $('#downloadServerButton')[0].click();
  	 },6000);
  }
	
}
           
           
if(document.body.innerText.indexOf('This Video Is No Longer Available') > -1){
	//window.location.href = 'https://www.google.com/search?client=firefox-b-d&q=' + document.location.href.split('/')[5].replace(/\+/g,' ')
           window.close();
}
           
     
