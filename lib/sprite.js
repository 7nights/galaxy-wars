(function(){
    var CONFIGS = {
        sprite: {
            x: 0,
            y: 0,
            img: '',
            id: '',
            target: null,
            exist: true
        }, 
        ship: {
            width: 10,
            height: 10,
            speed: 5,
            alpha: 1,
            alphaGap: 0.05,
            exploding: false
        },
        planet: {
            width: 100,
            height: 100,
            ships: 100,
            fecundity: 2, // number of increased ships per second
            focused: false,
            focusStyle: '#ff0000',
            mouseovered: false,
            mouseoverStyle: '#00ff00',
            targetlineStyle: '#ff0000'
        },
        stage: {
            onclick: function(){},
            onmouseover: function(){},
            onmouseout: function(){}
        },
        events: {
            click: 'ontouchstart' in window ? 'touchstart' : 'click'
        }
    };
    var uid = 0;

    function _extendClass(Child, Parent){
        var F = function(){};
        F.prototype = Parent.prototype;
        Child.prototype = new F();
        Child.prototype.constructor = Child;
    }
    function _getOffset(elem){
        var offset = [elem.offsetLeft, elem.offsetTop],
            parent = elem.offsetParent;

        while(parent){
            offset[0] += parent.offsetLeft;
            offset[1] += parent.offsetTop;
            parent = parent.offsetParent;
        }

        return offset;
    }

    // Stage Constructor
    function Stage(options){
        this.options = options || {};
        this.init();
    }
    Stage.prototype = {
        init: function(){
            var options = this.options,
                stageConfigs = CONFIGS.stage;

            this.sprites = [];
            this.canvas = options.canvas;
            this.ctx = this.canvas.getContext('2d');
            this.onclick = options.onclick || stageConfigs.onclick;
            this.onmouseover = options.onmouseover || stageConfigs.onmouseover;
            this.onmouseout = options.onmouseout || stageConfigs.onmouseout;
        },
        addSprites: function(sprites){
            if(!sprites) return;
            if(sprites instanceof Array){
                this.sprites = this.sprites.concat(sprites);
            } else {
                this.sprites.push(sprites);
            }
        },
        getSprites: function(){
            return this.sprites;
        },
        clearCanvas: function(){
            var canvas = this.canvas;

            this.ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    // Sprite Constructor
    function Sprite(options){
        this.options = options || {};
        this.init();
    }
    Sprite.prototype = {
        init: function(){
            var options = this.options,
                spriteConfig = CONFIGS.sprite;

            this.mergeProperties(options, spriteConfig);
            this.halfWidth = this.width / 2;
            this.halfHeight = this.height / 2;
            this.stage = this.options.stage;
            this.ctx = this.stage.canvas.getContext('2d');
            this.id = uid++;
        },
        draw: function(){
            if(!this.exist || !this.stage) return;   
            var canvas = this.stage.canvas;

            this.ctx.drawImage(this.img, this.x - this.halfWidth, this.y - this.halfHeight, this.width, this.height);
            // ctx.drawImage(this.img, x, y);
            // ctx.drawImage(this.img, x, y, width, height);
            // ctx.drawImage(this.img, sx, sy, swidth, sheight, x, y, width, height);
        },
        destory: function(){
            this.exist = false;
        },
        mergeProperties: function(options, configs){
            for(var i in configs){
                if(configs.hasOwnProperty(i)) {
                    this[i] = options[i] || configs[i];
                }
            }
        }
    }

    // Planet Constructor
    _extendClass(Planet, Sprite);
    function Planet(options){
        var opts = this.options = options || {},
            planetConfig = CONFIGS.planet;

        this.mergeProperties(opts, planetConfig);
        this.init();
        this.suroundingRadius = this.halfWidth + 10;

        this.addEventListeners();
    }
    Planet.prototype.draw = function(){
        Sprite.prototype.draw.call(this);
        if(this.focused) this.drawFocus();
        if(this.mouseovered && !this.focused) this.drawMouseover();
        if(this.target && this.target && this.target.mouseovered) this.drawTargetLine();
    }
    Planet.prototype.drawSuroundingCircle = function(opt){
        var ctx = this.ctx,
            canvas = this.stage.canvas;

        ctx.beginPath();
        ctx.arc(this.x, this.y, this.suroundingRadius, 0, Math.PI * 2);
        ctx.strokeStyle = opt.style;
        ctx.lineWidth = opt.lineWidth;
        ctx.stroke();
        ctx.closePath();
    }
    Planet.prototype.drawFocus = function(){
        this.drawSuroundingCircle({
            style: this.focusStyle,
            lineWidth: 2
        });
    }
    Planet.prototype.drawMouseover = function(){
        this.drawSuroundingCircle({
            style: this.mouseoverStyle,
            lineWidth: 1
        });
    }
    Planet.prototype.drawTargetLine = function(){
        var ctx = this.ctx,
            canvas = this.stage.canvas,
            planetX = this.x,
            planetY = this.y,
            targetX = this.target.x,
            targetY = this.target.y,
            deg = Math.atan(Math.abs(targetY - planetY) / Math.abs(targetX - planetX)),
            distX = targetX - planetX,
            distY = targetY - planetY,
            dx = Math.cos(deg) * this.suroundingRadius,
            dy = Math.sin(deg) * this.suroundingRadius;
       
        if(distX >= 0){
            if(distY >= 0){
                dx = dx;
                dy = dy;
            } else {
                dx = dx;
                dy = -dy;
            }
        } else {
            if(distY >= 0){
                dx = -dx;
                dy = dy;
            } else {    
                dx = -dx;
                dy = -dy;
            }
        }
        ctx.beginPath();
        ctx.moveTo(this.x + dx, this.y + dy);
        ctx.lineTo(this.target.x - dx, this.target.y - dy);
        ctx.strokeStyle = this.targetlineStyle;
        ctx.stroke();
        ctx.closePath();
    }
    Planet.prototype.addEventListeners = function(){
        if(!this.stage.clickListenerAdded){
            this.stage.clickListenerAdded = true;
            this.stage.canvas.addEventListener(CONFIGS.events['click'], this.clickHandler.bind(this));
        }
        if(!this.stage.mouseoverListenerAdded){
            this.stage.mouseoverListenerAdded = true;
            this.stage.canvas.addEventListener('mousemove' ,this.mousemoveHandler.bind(this));
        }
    }
    Planet.prototype.setFocus = function(bool){
        this.focused = bool;
    }
    Planet.prototype.getFocus = function(bool){
        return this.focused;
    }
    Planet.prototype.setMouseover = function(bool){
        this.mouseovered = bool;
    }
    Planet.prototype.getMouseover = function(){
        return this.mouseovered;
    }
    Planet.prototype.targetPlanet = function(planet){
        this.target = planet;
    }
    Planet.prototype.untargetPlanet = function(){
        var myTarget = this.target;

        this.target = null;
        this.focused = false;

        // remove target's focus status when target is only under attack
        if(!myTarget.target){
            myTarget.focused = false;
            myTarget.mouseovered = false;
        }
    }
    Planet.prototype.addShips = function(num){
        this.ships += num;
    }
    Planet.prototype.removeShips = function(num){
        this.ships -= num;
    }
    Planet.prototype.mouseEventHandler = function(e, type){
        var canvas = this.stage.canvas,
            offset = _getOffset(canvas),
            x = e.pageX - offset[0],
            y = e.pageY - offset[1],
            planets = this.stage.sprites,
            len = planets.length;

        planets.map(function(planet){
            var spriteWidth = planet.width,
                spriteHeight = planet.height,
                xRange = [],
                yRange = [],
                isInTarget,
                onclick = planet.stage.onclick,
                onmouseover = planet.stage.onmouseover,
                onmouseout = planet.stage.onmouseout;

            xRange = [planet.x - planet.halfWidth, planet.x + planet.halfWidth];
            yRange = [planet.y - planet.halfHeight, planet.y + planet.halfHeight];
            isInTarget = x >= xRange[0] && x <= xRange[1] && y >= yRange[0] && y <= yRange[1];
            switch(type){
                case 'click':
                    if(isInTarget){
                        onclick && onclick(planet);
                    }
                    break;
                case 'mousemove':
                    if(isInTarget){
                        if(!planet.mouseovered && !planet.focused){
                            onmouseover && onmouseover(planet);
                        }
                    } else {
                        if(planet.mouseovered){
                            onmouseout && onmouseout(planet);
                        }
                    }
                    break;
            }
        });
    }
    Planet.prototype.clickHandler = function(e){
        this.mouseEventHandler(e, 'click');
    }
    Planet.prototype.mousemoveHandler = function(e){
        this.mouseEventHandler(e, 'mousemove');
    }

    // Ship Constructor
    _extendClass(Ship, Sprite);
    function Ship(options){
        var opts = this.options = options || {},
            shipConfig = CONFIGS.ship;

        this.mergeProperties(opts, shipConfig);
        this.init();
    }
    Ship.prototype.draw = function(){
        if(this.exploding){
            this.drawExplodeEffect();
        } else {
            Sprite.prototype.draw.call(this);
        }
    }
    Ship.prototype.drawExplodeEffect = function(){
        if((this.alpha -= this.alphaGap) <= 0){
            this.destory();
            return;
        }
        var ctx = this.ctx,
            canvas = this.stage.canvas,
            gradient = this.ctx.createRadialGradient(this.x, this.y, 1, this.x, this.y, 5);

        gradient.addColorStop(0, 'rgba(255, 255, 255, '+ this.alpha +')');
        gradient.addColorStop(1, 'transparent');

        ctx.fillStyle = gradient;
        ctx.fillRect(this.x - this.halfWidth, this.y - this.halfHeight, this.width, this.height);    
    }
    Ship.prototype.setExplode = function(){
        this.exploding = true;
    }

    // export Constructors
    this.Stage = Stage;
    this.Sprite = Sprite;
    this.Planet = Planet;
    this.Ship = Ship;
}).call(this);