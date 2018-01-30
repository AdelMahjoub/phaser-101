GameState = {

    init: function () {
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.pageAlignHorizontally = true;
        this.scale.pageAlignVertically = true;
        this.time.desiredFps = 30;
    },

    preload: function () {

        this.load.path = 'assets/';
        this.load.image('bg:farm', 'images/background.png');

        this.load.spritesheet('spr:sheep', 'sprites/sheep_spritesheet.png', 244, 200, 3);
        this.load.spritesheet('spr:horse', 'sprites/horse_spritesheet.png', 211, 200, 3);
        this.load.spritesheet('spr:pig', 'sprites/pig_spritesheet.png', 297, 200, 3);
        this.load.spritesheet('spr:chicken', 'sprites/chicken_spritesheet.png', 131, 200, 3);

        this.load.audio('sfx:chicken', ['audio/chicken.mp3', 'audio/checken.ogg']);
        this.load.audio('sfx:horse', ['audio/horse.mp3', 'audio/horse.ogg']);
        this.load.audio('sfx:pig', ['audio/pig.mp3', 'audio/pig.ogg']);
        this.load.audio('sfx:sheep', ['audio/sheep.mp3', 'audio/sheep.ogg']);

        this.load.image('spr:arrow', 'images/arrow.png');
    },

    create: function () {

        this.background = this.add.image(0, 0, 'bg:farm');

        this.animalsData = [
            {key: 'spr:sheep', text: 'SHEEP', sfx: 'sfx:sheep'},
            {key: 'spr:chicken', text: 'CHICKEN', sfx: 'sfx:chicken'},
            {key: 'spr:pig', text: 'PIG', sfx: 'sfx:pig'},
            {key: 'spr:horse', text: 'HORSE', sfx: 'sfx:horse'}
        ];

        this.animals = this.game.add.group();

        this.animalsData.forEach(function (data) {
            let sprite = this.animals.create(this.world.bounds.x - 1000, this.world.centerY, data.key, 0);
            let sfx = this.add.audio(data.sfx);
            sprite.customParams = {text: data.text, sfx: sfx};
            sprite.anchor.setTo(0.5);
            sprite.inputEnabled = true;
            sprite.input.pixelPerfectClick = true;
            sprite.animations.add('feedback', [0, 1, 2, 1, 0, 1, 2, 1, 0], 3);
            sprite.events.onInputDown.add(this._animateAnimal, this);
        }.bind(this));

        this.currentAnimal = this.animals.next();
        this.currentAnimal.position.setTo(this.world.centerX, this.world.centerY);
        this._showText(this.currentAnimal);

        this.rightArrow = this.add.sprite(0, this.world.centerY, 'spr:arrow');
        this.rightArrow.x = this.world.width - this.rightArrow.width / 2;
        this.rightArrow.anchor.setTo(0.5);
        this.rightArrow.customParams = {direction: 1};
        this.rightArrow.inputEnabled = true;
        this.rightArrow.input.pixelPerfectClick = true;
        this.rightArrow.events.onInputDown.add(this._switchAnimal, this);

        this.leftArrow = this.add.sprite(0, this.world.centerY, 'spr:arrow');
        this.leftArrow.x = this.leftArrow.width / 2;
        this.leftArrow.anchor.setTo(0.5);
        this.leftArrow.scale.setTo(-1, 1);
        this.leftArrow.customParams = {direction: -1};
        this.leftArrow.inputEnabled = true;
        this.leftArrow.input.pixelPerfectClick = true;
        this.leftArrow.events.onInputDown.add(this._switchAnimal, this);

    },

    update: function () {
    },

    /**
     *
     * @param {Phaser.Sprite} sprite
     * @param {Phaser.Pointer} pointer
     * @private
     */
    _switchAnimal: function (sprite, pointer) {
        let newAnimal = null;
        let endX = 1000;
        switch (sprite.customParams.direction) {
            case 1:
                newAnimal = this.animals.next();
                newAnimal.x = this.world.bounds.x - newAnimal.width;
                endX = this.world.bounds.width + this.currentAnimal.width;
                break;
            case -1:
                newAnimal = this.animals.previous();
                newAnimal.x = this.world.bounds.width + newAnimal.width;
                endX = this.world.bounds.x - this.currentAnimal.width;
                break;
        }

        let newAnimalTransition = this.game.add.tween(newAnimal)
            .to({x: this.world.centerX}, 1000)
            .start()
            .onStart.addOnce(function () {
                this.animalText.visible = false;
                this.leftArrow.inputEnabled = false;
                this.rightArrow.inputEnabled = false;
                let currentAnimalTransition = this.game.add.tween(this.currentAnimal)
                    .to({x: endX}, 1000)
                    .start()
                    .onComplete.addOnce(function () {
                        this.currentAnimal = newAnimal;
                        this._showText(this.currentAnimal);
                        this.game.tweens.remove(newAnimalTransition);
                        this.game.tweens.remove(currentAnimalTransition);
                        this.leftArrow.inputEnabled = true;
                        this.rightArrow.inputEnabled = true;
                    }, this);
            }, this);

    },

    /**
     *
     * @param {Phaser.Sprite} sprite
     * @param {Phaser.Pointer} pointer
     * @private
     */
    _animateAnimal: function (sprite, pointer) {
        sprite.animations.play('feedback');
        sprite.customParams.sfx.play();
    },

    /**
     *
     * @param {Phaser.Sprite} sprite
     * @private
     */
    _showText(sprite) {
        const style = {
            font: 'bold 30pt arial',
            fill: '#d0171b',
            align: 'center'
        };
        if(!this.animalText) {
            this.animalText = this.game.add.text(this.world.centerX, 0, '', style);
            this.animalText.anchor.setTo(0.5, 0);
        }
        this.animalText.text = sprite.customParams.text;
        this.animalText.visible = true;
    },

};

window.onload = function () {
    const game = new Phaser.Game(640, 360, Phaser.AUTO);

    game.state.add('GameState', GameState);
    game.state.start('GameState');
};