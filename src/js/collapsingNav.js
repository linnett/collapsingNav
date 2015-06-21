class collapsingNav {

    constructor({navParent, navPrimary, navOverflow, moreLink, collapsedLink, breakpoint} = {}) {
        this.navParent = navParent ? "nav" : navParent;
        this.navPrimary = navPrimary ? ".navPrimary" : navPrimary;
        this.navOverflow = navOverflow ? ".navOverflow" : navOverflow;
        this.moreLink = moreLink ? ".js-more" : moreLink;
        this.collapsedLink = collapsedLink ? ".js-collapsed-link" : overflowLink;
        this.breakpoint = breakpoint ? "(min-width: 480px)" : breakpoint;
        this.moreLinkText = this.moreLink.replace(/^./, '');

        this.setNavValues();

        this.navItems = this.getAllNavItems();
        this.setWindowListeners();
        this.setClickHandlers();

        // Trigger resize event
        let event = document.createEvent('HTMLEvents');
        event.initEvent('resize', true, false);
        window.dispatchEvent(event);
    }

    setNavValues() {
        let links = document.querySelectorAll(`${this.navPrimary} a`),
            calculateSize = 0;

        Array.prototype.forEach.call(links, (e, i) => {
            calculateSize += outerWidth(e);
            e.setAttribute('data-right-edge', calculateSize);
            e.setAttribute('data-nav-index', i);
        });
    }

    createDOMArray(elem) {
        let domArray = [];

        Array.prototype.forEach.call(elem, (e) => {
            domArray.push(e);
        });

        return domArray;
    }

    removeChildren(el) {
        for (let i = 1; i < el.length; i++) {
            while (el[i].firstChild) {
                el[i].removeChild(el[i].firstChild);
            }
        }
    }

    getAllNavItems() {
        let navPrimaryItems,
            navOverflowItems,
            navItems = [];

        // Create an array of all the items in the primary nav and overflow nav
        navPrimaryItems = this.createDOMArray(document.querySelectorAll(`${this.navPrimary} a`));
        navOverflowItems = this.createDOMArray(document.querySelectorAll(`${this.navOverflow} a`));

        // Combine the 2 arrays and sort into order
        navItems = navPrimaryItems.concat(navOverflowItems);
        navItems.sort((a, b) => a.getAttribute('data-nav-index') - b.getAttribute('data-nav-index'));

        return navItems;
    }

    handleMoreEvent() {
        toggleClass(document.querySelector(this.navParent), 'show-nav');
    }

    setClickHandlers: function() {
        document.querySelector(this.moreLink).addEventListener('click', this.handleMoreEvent.bind(this), false);
        document.querySelector(this.collapsedLink).addEventListener('click', this.handleMoreEvent.bind(this), false);
    }

    setWindowListeners() {
        let mql = window.matchMedia(this.breakpoint),
            resizeEvent = this.collapseResponsive.bind(this);

        let mediaQueryResponse = (mql) => {
            // Remove children nodes to re-calculate
            this.removeChildren([
                this.options.navPrimary,
                this.options.navOverflow
            ]);

            // If the media query matches
            if (mql.matches) {
                window.addEventListener('resize', resizeEvent, false);
            } else {
                window.removeEventListener('resize', resizeEvent, false);
                this.collapseAllItems();
            }
        };

        // Call listener function explicitly at run time
        mediaQueryResponse(mql);
        // Attach listener function to listen in on state changes
        mql.addListener(mediaQueryResponse);
    }

    collapseResponsive() {
        var navWidth = outerWidth(document.querySelector(this.navPrimary)),
            moreWidth = outerWidth(document.querySelector(this.navItems[this.navItems.length - 1]));

        for (var i = 0; i < this.navItems.length; i++) {
            var navItem = this.navItems[i],
                rightEdge = navItem.getAttribute('data-right-edge'),
                totalWidth = parseInt(rightEdge) + moreWidth;

            if (hasClass(this.navItems[i], this.moreLinkText)) continue;

            // Check if navItem fits in primary nav. If not, move to overflow navigation.
            if (totalWidth < navWidth) {
                document.querySelector(this.navPrimary).insertBefore(navItem, document.querySelector(this.moreLink));
            } else {
                document.querySelector(this.navOverflow).appendChild(navItem);
            }
        }

        // Add menu overflow class
        if (document.querySelector('.nav-overflow a')) {
            addClass(document.querySelector(this.navParent), 'menu-overflow');
        } else {
            removeClass(document.querySelector(this.navParent), 'menu-overflow');
        }
    }

    // Collapse all navigation items
    collapseAllItems() {
        // Remove show-nav and menu-overflow classes
        removeClass(document.querySelector(this.navParent), 'menu-overflow');
        removeClass(document.querySelector(this.navParent), 'show-nav');

        // Re-apply sorted elements
        for (var i = 0; i < this.navItems.length; i++) {
            if (!hasClass(this.navItems[i], this.moreLinkText)) {
                document.querySelector(this.navOverflow).appendChild(this.navItems[i]);
            }
        }

        removeClass(document.querySelector(this.navParent), 'menu-overflow');
    }

    /* Helper functions */
    outerWidth(el) {
        var width = el.offsetWidth;
        var style = getComputedStyle(el);

        width += parseInt(style.marginLeft) + parseInt(style.marginRight);
        return width;
    }

    outerHeight(el) {
        var height = el.offsetHeight;
        var style = getComputedStyle(el);

        height += parseInt(style.marginTop) + parseInt(style.marginBottom);
        return height;
    }

    hasClass(el, className) {
        var classExists;

        if (el.classList) {
            classExists = el.classList.contains(className);
        } else {
            classExists = new RegExp('(^| )' + className + '( |$)', 'gi').test(el.className);
        }

        return classExists;
    }

    addClass(el, className) {
        if (el.classList) {
            el.classList.add(className);
        } else {
            el.className += ' ' + className;
        }
    }

    removeClass(el, className) {
        if (el.classList) {
            el.classList.remove(className);
        } else {
            el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
        }
    }

    toggleClass(el, className) {
        if (el.classList) {
            el.classList.toggle(className);
        } else {
            var classes = el.className.split(' ');
            var existingIndex = classes.indexOf(className);

            if (existingIndex >= 0)
                classes.splice(existingIndex, 1);
            else
                classes.push(className);

            el.className = classes.join(' ');
        }
    }

}