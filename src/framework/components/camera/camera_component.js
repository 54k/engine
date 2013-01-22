pc.extend(pc.fw, function () {
    /**
    * @component
    * @name pc.fw.CameraComponent
    * @class The Camera Component enables an Entity to render the scene.
    * @constructor Create a new Camera Component
    * @param {pc.fw.CameraComponentSystem} system The ComponentSystem that created this Component
    * @param {pc.fw.Entity} entity The Entity that this Component is attached to.
    * @extends pc.fw.Component
    * @property {pc.scene.Camera} camera The {@link pc.scene.CameraNode} used to render the scene
    * @property {String} clearColor The color used to clear the canvas to before the camera starts to render
    * @property {Number} nearClip The distance from the camera before which no rendering will take place
    * @property {Number} farClip The distance from the camera after which no rendering will take place
    * @property {Number} fov The Y-axis field of view of the camera, in degrees. Used for {@link pc.scene.Projection.PERSPECTIVE} cameras only. Defaults to 45.
    * @property {Number} orthoHeight The half-height of the orthographic view window (in the Y-axis). Used for {@link pc.scene.Projection.ORTHOGRAPHIC} cameras only. Defaults to 10.
    * @property {Number} aspectRatio The aspect ratio of the camera. This is the ratio of width divided by height. Default to 16/9.
    * @property {pc.scene.Projection} projection The type of projection used to render the camera.
    * @property {Boolean} activate Activate on load. If true the {@link pc.fw.CameraComponentSystem} will set {@link pc.fw.CameraComponentSystem#current} to this camera as soon as it is loaded.
    */
    var CameraComponent = function CameraComponent(system, entity) {
        // Bind event to update hierarchy if camera node changes
        this.on("set_camera", this.onSetCamera, this);
        this.on("set_clearColor", this.onSetClearColor, this);
        this.on("set_fov", this.onSetFov, this);
        this.on("set_orthoHeight", this.onSetOrthoHeight, this);
        this.on("set_nearClip", this.onSetNearClip, this);
        this.on("set_farClip", this.onSetFarClip, this);
        this.on("set_projection", this.onSetProjection, this);
    };
    CameraComponent = pc.inherits(CameraComponent, pc.fw.Component);

    pc.extend(CameraComponent.prototype, {
        addEffect: function (effect) {
            var numEffects = this.data.composer.effects.length;
            this.renderOffscreen(numEffects > 0);

            this.data.composer.effects.push(effect);
        },

        renderOffscreen: function (offscreen) {
            if (offscreen) {
                var device = pc.gfx.Device.getCurrent();
                var w = device.canvas.width;
                var h = device.canvas.height;

                var offscreenBuffer = new pc.gfx.FrameBuffer(w, h, true);
                var offscreenTexture = offscreenBuffer.getTexture();
                offscreenTexture.minFilter = pc.gfx.FILTER_NEAREST;
                offscreenTexture.magFilter = pc.gfx.FILTER_NEAREST;
                offscreenTexture.addressU = pc.gfx.ADDRESS_CLAMP_TO_EDGE;
                offscreenTexture.addressV = pc.gfx.ADDRESS_CLAMP_TO_EDGE;
                this.data.camera.setRenderTarget(new pc.gfx.RenderTarget(offscreenBuffer));
            } else {
                var backBuffer = pc.gfx.FrameBuffer.getBackBuffer();
                camera.setRenderTarget(new pc.gfx.RenderTarget(backBuffer));
            }
        },

        resize: function (x, y) {
            var numEffects = this.data.composer.effects.length;
            this.renderOffscreen(numEffects > 0);

            var viewport = camera.getRenderTarget().getViewport();
            var aspect = viewport.width / viewport.height;
            if (aspect !== camera.getAspectRatio()) {
                camera.setAspectRatio(aspect);
            }
        },

        /**
         * @function 
         * @name pc.fw.CameraComponent#screenToWorld
         * @description Convert a point from 2D screen space to 3D world space.
         * @param {Number} x x coordinate on screen.
         * @param {Number} y y coordinate on screen.
         * @param {Number} z The distance from the camera in world space to create the new point.
         * @param {pc.math.vec3} worldCoord [Optional] 3D vector to recieve world coordinate result.
         * @returns {pc.math.vec3} The world space coordinate.
         */
        screenToWorld: function (x, y, z, worldCoord) {
            return this.data.camera.screenToWorld(x, y, z, worldCoord);
        },

        onSetCamera: function (name, oldValue, newValue) {
            // remove old camera node from hierarchy and add new one
            if (oldValue) {
                this.entity.removeChild(oldValue);
            }        
            this.entity.addChild(newValue);
        },

        onSetClearColor: function (name, oldValue, newValue) {
            var color = parseInt(newValue);
            this.data.camera.getClearOptions().color = [
                ((color >> 24) & 0xff) / 255.0,
                ((color >> 16) & 0xff) / 255.0,
                ((color >> 8) & 0xff) / 255.0,
                ((color) & 0xff) / 255.0
            ];
        },

        onSetFov: function (name, oldValue, newValue) {
            this.data.camera.setFov(newValue);
        },

        onSetOrthoHeight: function (name, oldValue, newValue) {
            this.data.camera.setOrthoHeight(newValue);
        },

        onSetNearClip: function (name, oldValue, newValue) {
            this.data.camera.setNearClip(newValue);
        },

        onSetFarClip: function (name, oldValue, newValue) {
            this.data.camera.setFarClip(newValue);
        },

        onSetProjection: function (name, oldValue, newValue) {
            this.data.camera.setProjection(newValue);
        }
    });

    return {
        CameraComponent: CameraComponent
    }; 
}());
