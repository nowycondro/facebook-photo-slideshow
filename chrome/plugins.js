var FPS = FPS || {};

console.log("plugins");

FPS.plugins = {
    createALeaf: (config) => {
        /* Start by creating a wrapper div, and an empty img element */
        var leafDiv = document.createElement('div');
        var image = document.createElement('img');

        /* Randomly choose a leaf image and assign it to the newly created element */
        image.src = config.assetsLink + 'realLeaf' + utils.randomFromTo(1, 5) + '.png';
        // image.width = config.leavesSize.w;
        // image.height = config.leavesSize.h;

        leafDiv.style.top = "-100px";

        /* Position the leaf at a random location along the screen */
        leafDiv.style.left = utils.randomFromTo(0, window.innerWidth) + "px";

        /* Randomly choose a spin animation */
        var spinAnimationName = (Math.random() < 0.5) ? 'clockwiseSpin' : 'counterclockwiseSpinAndFlip';

        /* Set the -webkit-animation-name property with these values */
        leafDiv.style.webkitAnimationName = 'fade, drop';
        image.style.webkitAnimationName = spinAnimationName;

        /* Figure out a random duration for the fade and drop animations */
        var fadeAndDropDuration = utils.randomFloat(5, 11) + "s";

        /* Figure out another random duration for the spin animation */
        var spinDuration = utils.randomFloat(4, 8) + "s";
        /* Set the -webkit-animation-duration property with these values */
        leafDiv.style.webkitAnimationDuration = fadeAndDropDuration + ', ' + fadeAndDropDuration;

        var leafDelay = utils.randomFloat(0, 5) + "s";
        leafDiv.style.webkitAnimationDelay = leafDelay + ', ' + leafDelay;

        image.style.webkitAnimationDuration = spinDuration;

        // add the <img> to the <div>
        leafDiv.appendChild(image);

        /* Return this img element so it can be added to the document */
        return leafDiv;
    },
}