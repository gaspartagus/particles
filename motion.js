var Pi = Math.PI
  , cos = Math.cos
  , sin = Math.sin
  , sqrt = Math.sqrt
  , pow = Math.pow
  , abs = Math.abs
  , acos = Math.acos
  , asin = Math.asin
  , rand = Math.random
  , floor = Math.floor
  , min = Math.min
  , max = Math.max
  ;
  
var root = "img/";
var body = $("body");
var width = body.width();
var height = body.height();
var fpsEl = document.getElementById("framerate");
NodeList.prototype.forEach = Array.prototype.forEach;
document.oncontextmenu = function() {return false;};
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
ctx.fillStyle="#FF0000";
  
var Particules = []
  , ID = 0
  , G = 3000
  , roche = pow(2,1/3)
  , rho = 1/904.77
  ;
  
var framerate = 0,
    infiniteSpace,
    frottement,
    repulsion,
    accretion,
    dessin,
    pause = false;
    
if(localStorage.infiniteSpace){
  infiniteSpace = localStorage.infiniteSpace == "true"
    ? true
    : false;
  $('#infinite_space').prop('checked', infiniteSpace);
}

if(localStorage.frottement){
  frottement = localStorage.frottement == "true"
    ? true
    : false;
  $('#frottement').prop('checked', frottement);
}

if(localStorage.repulsion){
  repulsion = localStorage.repulsion == "true"
    ? true
    : false;
  $('#repulsion').prop('checked', repulsion);
}

if(localStorage.accretion){
  accretion = localStorage.accretion == "true"
    ? true
    : false;
  $('#accretion').prop('checked', accretion);
}

if(localStorage.dessin){
  dessin = localStorage.dessin == "true"
    ? true
    : false;
  $('#dessin').prop('checked', dessin);
}

setInterval(function(){
  // console.log(framerate)
  
  var E = energie();
  
  fpsEl.innerHTML = "FPS : " + framerate + "<br>N : " + Particules.length + "<br>E : " + E + "<br>T : " + T;
  
  // body[0].childNodes.forEach(function(el){
  //   if( !partobj[el.id] ){
  //     body[0].removeChild(el);
  //   }
  // })
},300)
  
function moteur(){
  
  var s = performance.now()/1000;
  
  function loop(t){
    
    // if(pause)
    //   setTimeout(function(){
    //     requestAnimationFrame(loop);
    //     pause = false;
    //   }, 1000)
    // else
      // requestAnimationFrame(loop);
    
    champ();
    
    
    Particules.forEach(function loopmove(p){
      p.moveon((t/1000-s)*2);
    })
    
    framerate = floor(1/(t/1000-s));
    
    s = t/1000;
    
    setTimeout(function(){
      loop(performance.now())
    },0)
    
  }
  
  loop(s)
  // requestAnimationFrame(loop);
}
  
function champ(){ //  force de toutes les particules sur A.
  Particules.forEach(function initzero(p){
    p.ax = 0;
    p.ay = 0;
  });
  
  var fusions = [];
  
  // console.log(Particules.length)
  
  Particules.forEach(function forceunitaire(p,i){
    
    var l = Particules.length;
    
    for(var j = i+1; j < l; j++ ){
      var q = Particules[j];
      
      var A = force(p,q); // force exercée par p sur q
      
      // vitesse relative : il y a collision si elle est assez importante (> 40 px/S)
      var vrel = sqrt(pow(p.vx-q.vx,2)+pow(p.vy-q.vy,2));
      
      if(A.n < (p.r+q.r)*0.8 && vrel > 40 && accretion){
        
        var r = fusion(p,q);
        
        // Particules.push(r);
        
        Particules.splice(i,1,r);
        remove(q);
        
        
        // Parfois de manière aléatoire cette étape échoue
        // en disant que le parent de l'élement n'est pas "body"
        // ou bien que "body" ne contient pas cet élement
        // try{
          p.destroy();
        // } catch(err){
        //   // console.log(err); 
        // }
        // try{
          q.destroy();
        // } catch(err){
        //   // console.log(err); 
        // }
      
        l -= 1;
        
      } else {
        p.ax -= A.x/p.m;
        p.ay -= A.y/p.m;
        q.ax += A.x/q.m;
        q.ay += A.y/q.m;
      }
      
    }
    
  });
}


var a = 2,
    e = 4,
    radius = 30 // px
    fr = 0.9
    ;

function force(A,B){
  
  if(A.x == B.x && A.y == B.y) return { x: 0, y: 0, n: 0};
  
  var prop = pow(radius,e);
  var n = n2(A,B);
  
  if(n > 100 && infiniteSpace) return { x: 0, y: 0, n: Infinity};
  // console.log(A.m,B.m)
  var res = {
    x: ((A.x-B.x)/abs(pow(n,a+1)) - (A.m*B.m/abs(A.m*B.m))*(A.x-B.x)/abs(pow(n,a+e+1))*prop*(repulsion ? 1 : 0))*G*A.m*B.m,
    y: ((A.y-B.y)/abs(pow(n,a+1)) - (A.m*B.m/abs(A.m*B.m))*(A.y-B.y)/abs(pow(n,a+e+1))*prop*(repulsion ? 1 : 0))*G*A.m*B.m,
    n: n
  };
  return res;

}

var T = 0;

function energie(){
  
  // console.log(Particules.length)
  var Ep = 0,
      Ec = 0;
  
  var l = Particules.length;
  
  Particules.forEach(function en(p,i){
    
    Ec += ( pow(p.vx,2) + pow(p.vy,2) )*p.m/2;
    
    for(var j = i+1; j < l; j++ ){
      
      var q = Particules[j];
      
      var n = n2(p,q);
    
      // console.log(A.m,B.m)
      Ep += -1*G*p.m*q.m*( 1/(a-1)/abs(pow(n,a-1)) - 1/(a+e-1)/abs(pow(n,a+e-1))*pow(radius,e)*(repulsion ? 1 : 0)  );
    }
  });
  T = floor(10*Ec/l);
  
  return floor((Ec+Ep)/l);
}


function remove(p){
  for(var i=0; i<Particules.length; i++){
    if(Particules[i].id == p.id){
      Particules.splice(i,1);
      return true;
    }
  }
}


function fusion(p,q){
  var res = resultante_fusion(p,q);
  // console.log(p.m+q.m,res.m)
  return new Particule((p.x*p.m+q.x*q.m)/res.m, (p.y*p.m+q.y*q.m)/res.m, res.vx, res.vy, res.m);
}

function resultante_fusion(A,B){
  
  var m = A.m + B.m
    , vx = (A.m*A.vx+B.m*B.vx)/m
    , vy = (A.m*A.vy+B.m*B.vy)/m
    ;
  return { vx: vx, vy: vy, m: m };
}

function maxPart(){
  var p = { m: 0 };
  Particules.forEach(function search(q){
    if(q.m > p.m){
      p = q;
    }
  })
  return p;
}

function satellite(x,y,wise){
  var p;
  
  if(Particules.length){
    
    p = maxPart();
    var r = n2(p,{x:x,y:y});
    
    if(wise == null){
      
      wise = ( -1 + 2*floor(2*rand()) );
      
      var v = sqrt(G*p.m/r);
    
      var alpha = angle(x-p.x,y-p.y) + Pi/2*wise ;
      
      var m = p.m/70*rand();
      
      var q = new Particule(x,y,v*cos(alpha),v*sin(alpha),m)
      Particules.push(q);
    } else {
      
      var beta = rand()*2*Pi;
      var alpha = beta + Pi/2*wise;
    
      var m = p.m/600*rand();
      
      r = r*(1+rand()*0.1);
      
      var v = sqrt(G*p.m/r);
      
      var q = new Particule(p.x + r*cos(beta),p.y + r*sin(beta),v*cos(alpha),v*sin(alpha),m)
      Particules.push(q);
      
    }
    
    
    
  } else {
    
    p = new Particule(x,y,0,0,100);
    Particules.push(p);
  }
}

function Particule(X,Y,Vx,Vy,M){
  
  // var beta = v/c,
  //     gamma = 1/(1-beta*beta);
    
  ID += 1;
  
  var r = pow(3/4/Pi*abs(M)/rho,1/3)  // -> rho = M/V = 1/(4/3*Pi*6³) = 1/904.77
    , TO
    , self = this
    , id = ID
    , color = M > 0 ? "red" : "blue"
    ;
  
  // partobj[id] = true;

    
  var el = $("<div>", {
    id: id,
    class: "particule",
    style: "transform: translate("+ (X-r) +"px,"+ (Y-r) +"px);"
    + "width:" + (r*2) + "px; height: " + (r*2) + "px; background-color: "+ color + ";"
  })
  
  this.x = X;
  this.y = Y;
  this.vx = Vx;
  this.vy = Vy;
  this.ax = 0;
  this.ay = 0;
  this.r = r;
  this.m = M;
  this.id = id;
  this.exists = true;
  this.tobedestroyed = false;
  this.time = performance.now()
  
  body.append(el);
  
  var El = el[0]; // document.getElementById(id);
  
  function moveon(dt){
    self.time = performance.now();
    
    if(self.tobedestroyed){
      
      // try {
      //   destroy();
      // } catch(err) {
      //   // console.log(err);
      // }
      
    } else {
      // si la particule est trop loin
      if(abs(self.x-width/2) > 3*width || abs(self.y-height/2) > 3*height){
        remove(self, Particules);
        destroy();
      }
      self.vx += self.ax*dt;
      self.vy += self.ay*dt;
      
      
      if(frottement){
        self.vx *= fr;
        self.vy *= fr;
      }
      // var vn = sqrt(pow(self.vx,2) + pow(self.vx,2));
      // if(vn*dt > 11){
      //   self.vx *= 10/vn;
      //   self.vy *= 10/vn;
      // }
      
      self.x += self.vx*dt;
      self.y += self.vy*dt;
      
      if(dessin) ctx.fillRect(self.x,self.y,1,1);
      El.style.transform = "translate("+ (self.x-r) +"px,"+ (self.y-r) +"px)";
    }
    
      

    // el.css("transform","translate("+ (self.x-r) +"px,"+ (self.y-r) +"px)");
    
    
      
  }
  
  // temps de vie -lambda*ln(Math.random())
  
  
  
  function destroy(){
    // self.exists = false;
    // partobj[id] = false;
    document.body.removeChild(El);
    remove(self);
  }
  
  // si la particule ne bouge plus, elle s'autodétruit
  var cnt = 0;
  var watchdog = setInterval(function watch(){
    
    if(cnt > 3) clearInterval(watchdog);
    
    if(performance.now()-self.time > 300){
      // try {
        cnt++;
        destroy();
      // } catch(err){
      //   // console.log(err);
      // }
    }
  },300)
  
  this.el = el;
  this.moveon = moveon;
  this.destroy = destroy;

  
  return this;
}


// var p = new Particule(width/2-100,height/2,0,-20),
//     q = new Particule(width/2+100,height/2,0,20);
//     r = new Particule(width/2,height/2-300,20,0);

// Particules.push(p);
// Particules.push(q);
// Particules.push(r);

// Dual Explosion
// for(var i = 0; i < 200; i ++){
//   var p = new Particule(10*i,height/2,0,pow(-1,i)*30);
//   Particules.push(p);
// }

// Single explosion
// for(var i = 0; i < 100; i ++){
//   var p = new Particule(50*i,height/2,0,pow(-1,i)*30);
//   Particules.push(p);
// }

// for(var i = 0; i < 100; i ++){
//   var p = new Particule(width/2 + (0.5-rand())*5000,height/2 + (0.5-rand())*3000,0,0);
//   Particules.push(p);
// }

moteur(Particules);








function n1(A,B){
  return abs(A.x - B.x) + abs(A.y - B.y);
}

function n2(A,B){
  return sqrt( pow(A.x - B.x,2) + pow(A.y - B.y,2) );
}

function angle(x,y){
  if(y >= 0){
    return acos(x/sqrt(x*x + y*y));
  } else
    return -1*acos(x/sqrt(x*x + y*y));
}

function add(vects){
  var x = 0,
      y = 0;
  vects.forEach(function(v){
    x += v.x;
    y += v.y;
  });
  return { x:x, y:y };
}

function pol(A) {
  return {
    alpha: angle(A.x, A.y),
    v: sqrt(A.x*A.x + A.y*A.y)
  };
}
function cart(A) {
  return {
    x: A.v*cos(A.alpha),
    y: A.v*sin(A.alpha)
  };
}

function signe(x){
  return x >= 0
    ? 1
    : -1
}


function texte(){
  
  var s = Particules.map(function(p){
    return {
      x: p.x,
      y: p.y,
      vx: p.vx,
      vy: p.vy,
      m: p.m
    }
  })
  
  return JSON.stringify({
    s,
    accretion,
    repulsion,
    frottement,
    infiniteSpace
  });
}


// interactions clavier - souris

body.keypress(function(evt){
  console.log(evt.which);
  if(evt.which == 109){ // M : slightly shifted aligned particules
    
    for(var i = 0; i < 200; i ++){
      var p = new Particule(6*i,height/2 + pow(-1,i)*3.5,0,0,1);
      Particules.push(p);
    }
  } else if(evt.which == 101){ // E : erase all
    
    // Particules.forEach(function(p){
    //   p.destroy();
    // })
    Particules.splice(0,Particules.length)
    // Particules = [];
    // pause = true;
    
    // ctx.clearRect(0, 0, 4000, 4000);

  } else if(evt.which == 108){ // L : aligned particules
    
    for(var i = 0; i < 100; i ++){
      var p = new Particule(13*i,height/2,0,pow(-1,i)*0,1);
      Particules.push(p);
    }
  } else if(evt.which == 114){ // R : 100 random particules
    
    for(var i = 0; i < 100; i ++){
      var x = (0.5-rand())*width,
          y = (0.5-rand())*height,
          alpha = angle(x,y),
          n = sqrt(x*x+y*y),
          m = 0.3 + 0.6*rand();
          
      var p = new Particule(width/2 + x, height/2 + y,0,0,m); //20000*cos(alpha + Pi/2)/n, 20000*sin(alpha + Pi/2)/n);
      Particules.push(p);
    }
  } else if(evt.which == 100){
    
    remove(Particules[0],Particules);
    
  } else if(evt.which == 112){
    
    var a = rand()*2*Pi,
        v = 60;
    
    var p = new Particule(width/2 + (0.5-rand())*width,height/2 + (0.5-rand())*height,v*cos(a),v*sin(a),1*rand());
    
    Particules.push(p);
  } else if(evt.which == 115){
    var added = Particules.map(function(p){
      
      var beta = rand()*2*Pi;
      
      var alpha = beta + Pi/2*( -1 + 2*floor(2*rand()) );
    
      var m = p.m/200*(1 + 0.5*rand());
      
      r = p.r*2*(1+rand()*0.1);
      
      var v = sqrt(G*p.m/r);
      
      return new Particule(p.x + r*cos(beta),p.y + r*sin(beta),p.vx + v*cos(alpha),p.vy + v*sin(alpha),m)
    })
    Particules = Particules.concat(added);
    
  } else if(evt.which == 99){ // C : 144 particules crystal
    
    var demicoté = 6;
    for(var i = -demicoté; i < demicoté; i ++){
      for(var j = -demicoté; j < demicoté; j ++){
        
        var x = width/2 + radius*i ,
            y = height/2 + radius*j,
            m = 1;
            
        var p = new Particule(x,y,0,0,m*pow(1,i+j)); //20000*cos(alpha + Pi/2)/n, 20000*sin(alpha + Pi/2)/n);
        Particules.push(p);
      }
    }
  }
})

$("#infinite_space").click(function(e){
  infiniteSpace = $(this).prop('checked');
  localStorage.infiniteSpace = infiniteSpace;
  e.stopPropagation();
})

$("#frottement").click(function(e){
  frottement = $(this).prop('checked');
  localStorage.frottement = frottement;
  e.stopPropagation();
})

$("#repulsion").click(function(e){
  repulsion = $(this).prop('checked');
  localStorage.repulsion = repulsion;
  e.stopPropagation();
})

$("#accretion").click(function(e){
  accretion = $(this).prop('checked');
  localStorage.accretion = accretion;
  e.stopPropagation();
})

$("#dessin").click(function(e){
  dessin = $(this).prop('checked');
  localStorage.dessin = dessin;
  e.stopPropagation();
})


// $("#save").on("click", function () {
//   this.value = texte(Particules);
// });
$("#copy").on("click", function () {
  var s = $("#save").focus()[0];
  s.value = texte();
  s.select();
  document.execCommand('copy');
});

$("#load").on("click", function () {
  var instructions = $("#save").val();
  try{
    ins = JSON.parse(instructions);
    
    accretion = ins.accretion;
    repulsion = ins.repulsion;
    frottement = ins.frottement;
    infiniteSpace = ins.infiniteSpace;
    
    $("#accretion").prop("checked",accretion)
    $("#repulsion").prop("checked",repulsion)
    $("#frottement").prop("checked",frottement)
    $("#infinite_space").prop("checked",infiniteSpace)
    
    Particules.forEach(function(p){
      p.destroy();
    })
    Particules = [];
    
    ins.s.forEach(function(p){
      var q = new Particule(p.x,p.y,p.vx,p.vy,p.m);
      Particules.push(q);
    })
    
  } catch(err){
    console.log(err)
  }
});

$("#e_select").change(function(evt){
  // console.log(evt);
  e = evt.currentTarget.valueAsNumber;
})

body.mousedown(function(evt){
  
  if(evt.target.className == "action")
    return true;
  
  if(evt.button == 0){
    var p = new Particule(evt.pageX,evt.pageY,0,0,1); //20000*cos(alpha + Pi/2)/n, 20000*sin(alpha + Pi/2)/n);
    Particules.push(p);
    // satellite(evt.pageX,evt.pageY);
  }
  else if( evt.button == 2) {
    
    var n = 50,
        gamma = 2*Pi/n,
        x = evt.pageX,
        y = evt.pageY;
    
    p = maxPart();
    var R = n2(p,{x:x,y:y});
    
    for(var i = 0; i < 50; i ++) {
    
      var beta = rand()*2*Pi;
      var alpha = beta + Pi/2;
    
      var m = p.m/600*rand();
      
      r = R*(1+rand()*0.1);
      
      var v = sqrt(G*p.m/r + G*p.m/600*0.5/r*(1-cos(gamma))/pow(sin(gamma),2));
      
      var q = new Particule(p.x + r*cos(beta),p.y + r*sin(beta),v*cos(alpha),v*sin(alpha),m)
      Particules.push(q);
    }
  }
  
  evt.stopPropagation();
})

// bla