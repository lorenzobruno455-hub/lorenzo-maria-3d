import{findPath}from'./navigation.js';
self.onmessage=({data:{id,from,to,obstacles,grid}})=>{const started=performance.now();try{const path=findPath(from,to,obstacles,{grid});self.postMessage({id,path,ms:performance.now()-started});}catch{self.postMessage({id,path:[]});}};
