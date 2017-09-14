//=============================================================================
// Add New Tileset
//=============================================================================
function addNewTileset(){
    var regex = {
        url : /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/,
        imageUrl : /\.(jpeg|jpg|gif|png)$/
    };
    var url = prompt("Lütfen resim URL'sini giriniz:");
    if( url === null ) return false;
    if( !regex.url.test(url) )
    {
        alert("!!! - Lütfen doğru bir URL giriniz.");
        return false;
    }
    else
    {
        if( !regex.imageUrl.test(url) )
        {
            alert("!!! - Lütfen doğru bir resim URL'i giriniz.");
            return false;
        }
        else
        {
            var oZJCo = decodeURIComponent(url).split("/");
            var aWani = oZJCo[oZJCo.length - 1].split(".");
            var imgName = aWani.splice(0,(aWani.length - 1)).join("_").replace("-","_");
            var imgId   = String(Math.random()).split(".")[1];

            TILESET_LIST[imgId] = {
                id   : imgId, 
                name : imgName
            };
            
            var dom = "<li data-id='"+imgId+"'><span id='tileset-name'>"+imgName+" <span style='color:#aaa;'>(Yükleniyor)</span></span></li>";
            $("#list > ul#tileset-list").append(dom);

            var img  = new Image();
            img.src  = url;
            img.setAttribute("data-name",imgName);
            img.setAttribute("data-id",imgId);
            img.onload = function(){
                var settings = getSettings();
                var id = this.getAttribute("data-id");
                var imgName = this.getAttribute("data-name");
                TILESET_LIST[id].img = img;
                $("li[data-id='"+id+"'] > span#tileset-name").html(imgName).attr("onclick","selectTileset(this)").append(" <span id='isSelected' data-id='"+id+"' is-selected='false'></span>").parent().append("<img class='delete' src='img/substract.png' title='Delete tileset' onclick='deleteTileset(\""+id+"\")'>");
            
                //set first gid and last gid
                var firstGid = MEMORY.lastGid + 1;
                var lastGid  = (this.width / settings.tileset.width) * (this.height / settings.tileset.height) + MEMORY.lastGid;
                TILESET_LIST[id].firstGid = firstGid;
                TILESET_LIST[id].lastGid  = lastGid;

                MEMORY.lastGid = lastGid;
            }
        }
    }
}

//=============================================================================
// Select Tileset
//=============================================================================
function selectTileset(elem){
    if( SELECTED_TILESET !== null && SELECTED_TILESET.hasOwnProperty("id") )
    {
        var lastId = SELECTED_TILESET.id;
        $("span#isSelected[data-id='"+lastId+"']").attr("is-selected","false");
    }
    elem   = elem.parentNode;
    var id = elem.getAttribute("data-id");
    SELECTED_TILESET = TILESET_LIST[id];
    $("span#isSelected[data-id='"+id+"']").attr("is-selected","true");

    runDrawing(ctx);
}
//=============================================================================
// Delete Tileset
//=============================================================================
function deleteTileset(id){
    if( !TILESET_LIST.hasOwnProperty(id) ) return false;
    delete TILESET_LIST[id];
    $("li[data-id='"+id+"']").remove();
}

//=============================================================================
// Resize Canvas
//=============================================================================
function resizeCanvas(){
    var width  = $("input[name='c_width']").val();
    var height = $("input[name='c_height']").val();
    if( !width || !height )
    {
        alert("Lütfen bütün yerleri doldurunuz.");
        return false;
    }
    else
    {
        $("canvas#canvas")[0].width  = width;
        $("canvas#canvas")[0].height = height;
    }
}

//=============================================================================
// Get Settings
//=============================================================================
function getSettings(){
    return {
        tileset : {
            width : parseInt($("input[name='tileset_width']").val()),
            height: parseInt($("input[name='tileset_height']").val())
        }
    };
}

//=============================================================================
// Draw tileset to canvas
//=============================================================================
function runDrawing(ctx,fps){
    if(typeof fps === "undefined") fps = 60;
    clearInterval(tilesetInterval);
    if( SELECTED_TILESET.img.width > ctx.canvas.width || SELECTED_TILESET.img.height > ctx.canvas.height )
    {
        var c = confirm("Ekranda gösterilecek resim canvas boyutundan büyük. Canvası yeniden boyutlandıralım mı?");
        if( c )
        {
            ctx.canvas.width  = SELECTED_TILESET.img.width;
            ctx.canvas.height = SELECTED_TILESET.img.height;
            updateCanvasSizeIndicator(); 
        }
    }
    //better pixel art graphics settings
    ctx.imageSmoothingEnabled    = false;
    ctx.msImageSmoothingEnabled  = false;
    ctx.mozImageSmoothingEnabled = false;

    var tilesetInterval = setInterval(function(){
        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
        ctx.drawImage(SELECTED_TILESET.img,0,0);

        //draw grids
        var settings = getSettings();
        var row = SELECTED_TILESET.img.width / settings.tileset.width;
        var col = SELECTED_TILESET.img.height / settings.tileset.height;
        var gridColor = $("input[name='grid_color']").val();
        
        if( row % 1 !== 0 || col % 1 !== 0  )
        {
            alert("Tileset'in boyutu "+settings.tileset.width+"x"+settings.tileset.height+" boyutlarını desteklememektedir. Bu yüzden grid(ızgara) çizilemiyor.");
            clearInterval(tilesetInterval);
            return false;
        }

        for( var c=0; c < col; c++ )
        {
            for( var r=0; r < row; r++ )
            {
                ctx.beginPath();
                ctx.strokeStyle = gridColor;
                //horizontal line
                ctx.moveTo(r * settings.tileset.width, c * settings.tileset.height);
                ctx.lineTo(r * settings.tileset.width + settings.tileset.width, c * settings.tileset.height);
                //vertical line
                ctx.moveTo(r * settings.tileset.width, c * settings.tileset.height);
                ctx.lineTo(r * settings.tileset.width, c * settings.tileset.height + settings.tileset.height);
                ctx.stroke();
                ctx.closePath();
            }
        }
    }, 1000 / fps);
}

//=============================================================================
// Update canvas size indicator inputs
//=============================================================================
function updateCanvasSizeIndicator(){
    $("input[name='c_width']").val(ctx.canvas.width);
    $("input[name='c_height']").val(ctx.canvas.height);
}