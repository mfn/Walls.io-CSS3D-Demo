/**
 * @author Markus Fischer <markus@fischer.name>
 */
(function () {
  // THREE.js
  var camera, renderer, controls;
  var scene = new THREE.Scene();
  var objects = [], targets = [];
  var postsReceived = 0;
  var maxPosts = 32;
  var stream = new WallStreamCore({
    accessToken: "5f864451221b0e8d2ff61b3179ac1a3b5d4ac9e3",
    initialLimit: maxPosts * 2, // twice, because we only use posts wit images
    onPost: function (post) {
      if (!post.post_image) {
        return;
      }
      console.log(post);
      if (postsReceived === maxPosts) {
        stream.stop();
        return;
      }
      postsReceived++;
      if (postsReceived <= 5) {
        addPost(post);
      }
      if (postsReceived === 5 /* initial init */) {
        // only init once we've a few posts with images
        init();
        animate();
      } else if (postsReceived > 5) {
        postsQueue.push(post);
        // append new posts
        transform(targets, 1000);
      }
    }
  });
  var posts = [];
  var postsQueue = [];
  /**
   * Try to pick a post out of the queue every second and show it
   */
  setInterval(function () {
    var post = postsQueue.shift();
    if (post) {
      addPost(post);
      transform(targets, 1000);
    }
  }, 1250);
  function addPost(post) {
    var $post = $('<div></div>')
      .addClass('post');
    var $link = $('<a></a>')
      .attr('href', post.post_link)
      .attr('target', '_blank');
    var comment = post.comment;
    if (comment && comment.length > 128) {
      comment = comment.substr(0, 128) + '…';
    }
    $link.append($('<div></div>')
      .addClass('comment')
      .text(comment));
    if (post.external_image) {
      var $img = $('<img>')
        .addClass('user')
        .attr('src', post.external_image);
      $link.append($img);
    }
    if (post.external_name) {
      var $name = $('<div></div>')
        .addClass('name')
        .text(post.external_name);
      $link.append($name);
    }
    if (post.post_image) {
      var $img = $('<img>')
        .addClass('posted')
        .attr('src', post.post_image);
      $link.append($img);
    }
    $post.append($link);
    // create CSS3D object with their random positions
    var object = new THREE.CSS3DObject($post.get(0));
    object.position.x = Math.random() * 8000 - 2000;
    object.position.y = Math.random() * 8000 - 2000;
    object.position.z = Math.random() * 8000 - 2000;
    scene.add(object);
    objects.push(object);
    posts.push(post);
  }

  function init() {
    camera = new THREE.PerspectiveCamera(
      40, // fov
      window.innerWidth / window.innerHeight, // aspect
      1, // near frustum
      1000 // far frustum
    );
    camera.position.z = 3000;

    // create destinations
    var vector = new THREE.Vector3();
    // multiply maxPosts by 2 to only cover one side of the sphere
    for (var i = 0, l = maxPosts * 2; i < l; i++) {
      var phi = Math.acos(-1 + ( 2 * i ) / l);
      var theta = Math.sqrt(l * Math.PI) * phi;
      var object = new THREE.Object3D();
      object.position.x = 800 * Math.cos(theta) * Math.sin(phi);
      object.position.y = 800 * Math.sin(theta) * Math.sin(phi);
      object.position.z = 800 * Math.cos(phi);
      vector.copy(object.position).multiplyScalar(2);
      object.lookAt(vector.negate());
      targets.push(object);
    }
    // CSS3D
    renderer = new THREE.CSS3DRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    $('#container').append(renderer.domElement);
    // Controls
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    controls.rotateSpeed = 0.5;
    controls.minDistance = 500;
    controls.maxDistance = 6000;
    controls.addEventListener('change', render);

    transform(targets, 1000);
    window.addEventListener('resize', onWindowResize, false);
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    render();
  }

  function animate() {
    requestAnimationFrame(animate);
    TWEEN.update();
    controls.update();
  }

  function render() {
    renderer.render(scene, camera);
  }

  function transform(targets, duration) {
    TWEEN.removeAll();
    for (var i = 0; i < targets.length; i++) {
      var object = objects[ i ];
      // we lazy fill objects we need to check if there's one actually
      if (!object) {
        break;
      }
      var target = targets[ i ];
      new TWEEN.Tween(object.position)
        .to({ x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();
      new TWEEN.Tween(object.rotation)
        .to({ x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration)
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();
    }
    new TWEEN.Tween(this)
      .to({}, duration * 2)
      .onUpdate(render)
      .start();
  }
})();
