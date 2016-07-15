//////////////////////////////////////////
//             SakuraVIX                //
//////////////////////////////////////////


var requestURL ="http://finance.google.com/finance/info?client=ig&q=^VIX" 
//number of sakura
var target = 1;
//make sure the leaves appear in the top section of the screen (branches)
var treePoint = new Point(view.size.width,((view.size.height*.8)));
//this variable holds bounding boxes for branches used for sakura placement
var branchBoxes = [];


//////////////////////
// Helper functions //
//////////////////////

function toRad(angle){
    var newAngle = Math.PI*angle/180;
    return(newAngle);
}


// Returns a random integer between min and max
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

//returns a point within specified rectangle..
function randomInRect (rectangle, offset){
    var tl = rectangle.topLeft;
    var br = rectangle.bottomRight;
    var randX = getRandomInt(tl.x+offset,br.x-offset);
    var randY = getRandomInt(tl.y-offset,br.y+offset);
    var randomPoint = new Point(randX, randY);
    return(randomPoint);
};


function getSakuraColor(){
    sakuraColors = ['#fbe3e1','#ff7d6d','#ff3957','#ff7e9b','#ffbbba','#fb3e1']
    return sakuraColors[getRandomInt(0,4)];
}


////////////////////
// Tree function  //
////////////////////

function SakuraTree(){

    //Tree Stuff
    this.treeDepth = 10;
    this.numTrees =  1;
    this.treeColor =  "5F4A4B";
    this.treeBasePoint = new Point(900,730);//startPoint+ new Point(10*treeDepth,10*treeDepth);
    this.angle =   -90;
    this.drawBranch = function(startPoint, endPoint,depth){

        var branch = new Path.Line(startPoint,endPoint);
        branch.strokeColor = this.treeColor;
        branch.strokeWidth = depth;

        if(depth<6){
        //push the smaller branch boxes into our array       
        branchBoxes.push(branch.bounds);

        }
    };

    this.drawTree = function(startPoint, angle, depth){

    if (depth!= 0){
        var newAngle = toRad(angle);
        var branchLength = (12*depth);
        var endX = startPoint.x + (Math.cos(newAngle)*branchLength);
        var endY = startPoint.y + (Math.sin(newAngle)*branchLength);
        var endPoint = new Point(endX, endY);
        
        this.drawBranch(startPoint,endPoint,depth);

        this.drawTree(endPoint, angle+20, depth-1);
        this.drawTree(endPoint, angle-40, depth-1);
        }
    };

    this.drawTreeStump = function(treeDepth){
        var tsX = this.treeBasePoint.x;
        var tsY = this.treeBasePoint.y + (this.treeDepth*10);
        var treeStumpPoint = new Point(tsX, tsY);
        var treeStump = new Path(this.treeBasePoint, treeStumpPoint);
        treeStump.strokeColor = this.treeColor;
        treeStump.strokeWidth = this.treeDepth;
        var treeBase1 = new Path(treeStumpPoint, new Point(treeStumpPoint.x+(this.treeDepth*5),treeStumpPoint.y));
        treeBase1.strokeColor = this.treeColor;
        treeBase1.strokeWidth = treeDepth/2;
        treeBase1.position = treeStumpPoint;
    
        treeBase2 = treeBase1.clone();
        treeBase2.scale(.8);
        var treeBase2point = new Point(tsX,tsY+treeDepth);
        treeBase2.position = treeBase2point;
        treeBase2.strokeWidth = treeDepth/4;
        };
    
    this.draw = function(){
        this.drawTree(this.treeBasePoint,this.angle,this.treeDepth);
        this.drawTreeStump(this.treeDepth);
    }

}

/////////////
// Sakuras //
/////////////

function Sakuras(){
    this.group = new Group();
    this.children = this.group.children;
   //var falling = [];
    //var fallSpeed = [];
    this.groundTime = 100;
    //var rotateSpeed = [];

    this.make = function(i){

            var randomBranchBox = getRandomInt(0,branchBoxes.length-1);
            var center = randomInRect(branchBoxes[randomBranchBox],0); //randomBranchPoint;//new Point(Point.random()*treePoint);
            var sakura = new Path.RegularPolygon(center,8,20);
            var index = i;
            sakura.fillColor = getSakuraColor();
            sakura.scale(Math.random() * (1 - .1) + .1);
            sakura.rotate(getRandomInt(0,360));
            sakura.falling = false;
            sakura.speed = Math.random() * (5 - .1) + .1;
            sakura.rotateSpeed = getRandomInt(-5,5);
            sakura.groundTime = 0;
            sakura.opacity = 0;
            sakura.toDelete = false;

            return sakura;  
        };

    this.add =  function(group){
                var len = this.children.length;
                var sakura = this.make(len);
                var fallingvar = getRandomInt(1,30);
                if ((fallingvar == 1)){
                    sakura.falling = true;     
                }
            
                this.group.addChild(sakura);
            };

    this.remove =  function(sakura){

            this.children[sakura.index].remove();

        };
       
    this.iterate =  function(){

            var len = this.children.length;

            //we need to check if there are any that need deleting
            for(var i = len-1; i >= len; i--){
                
                var sakura = this.children[i];

                if(sakura.toDelete == true){
                    this.remove(sakura);
                    len--;
                }

            }


            //if we are below target, we need to add some sakuras

            if(len < target){
                this.add();
            }

            for(var i = 0; i < len; i++){
                
                var sakura = this.children[i];

                if((sakura.groundTime === 0 ) && (sakura.opacity < 1)){
                    sakura.opacity += .01;
                }
                var fallChance = getRandomInt(1,1800);

               //check it is falling
               //if so keep it falling
               if (sakura.falling === true){
                   sakura.position.y += sakura.speed;
                   sakura.rotate(sakura.rotateSpeed);
               }

                //if the sakura isnt in motion, should we put it in motion?
                if ((sakura.falling === false)&&(fallChance == 1)&&(sakura.opacity >= 1)){

                    sakura.falling = true;
                    
                }
                // If the item has left the view on the bottom, stop its motion
                if (sakura.bounds.bottom > 895 /*treeBasePoint.y+(treeDepth*16)*/){
                    sakura.falling = false;

                        if(sakura.groundTime > 100){
                            sakura.opacity -=.01;
                        }
                        if(sakura.opacity <= .01){

                            sakura.toDelete = true;

                        }
                    
                   sakura.groundTime++;
                    
                   
                }


                }
               
            }; 
    
}


//////////////////
// Ajax Request //
//////////////////

function updateTarget(){ 
    $.ajax({
    url: requestURL,
    dataType: "jsonp",
    success: function(data){        
        var v = data[0].l;
      // $("#vix").html(v);
        target = Math.floor(3000/v);
       // $("#target").html(target).css("color","green");
    },
    error: function(){
        target = 100;
       // $("#vix").html("100").css("color","red");
    }

}
);

}

////////////
///setup////
////////////

updateTarget();
var sakuratree = new SakuraTree();
sakuratree.draw();
var sakuras = new Sakuras();

///////////////
// Animation //
///////////////

function onFrame(event){
    sakuras.iterate();

    if((event.count%1200 == 0)){
    	updateTarget();
    }

   // $("#sakuras").html(sakuras.children.length).css("color","pink");
}