$(document).ready(function(){
    function load(path,blob){
        var req=new XMLHttpRequest();
            req.open('GET',path,true);
            req.responseType="arraybuffer";
            
            req.onload=function(){
                var mime=this.getResponseHeader('content-type');
                blob(new Blob([this.response],{type:mime}));
            };
            req.send();
        }
    $(".but").click(function(){
        var path="/listen/"+$(this).text();
        load(path,function(blob){
            var url=URL.createObjectURL(blob);
            var song=document.getElementById("aud");
            song.src=url;
        });
    });
    
        
});