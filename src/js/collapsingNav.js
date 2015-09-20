'use strict';

class collapsingNav {

    constructor(navParent, navPrimary, navOverflow, moreLink, collapsedLink, breakpoint) {
        this.navParent = navParent || "nav";
        this.navPrimary = navPrimary || ".nav-primary";
        this.navOverflow = navOverflow || ".js-nav-overflow";
        this.moreLink = moreLink || ".js-more";
        this.collapsedLink = collapsedLink || ".js-collapsed-link";
        this.breakpoint = breakpoint || "(min-width: 480px)";
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
            calculateSize += this.outerWidth(e);
            e.setAttribute('data-right-edge', calculateSize);
            e.setAttribute('data-nav-index', i);
            e.setAttribute('data-width', this.outerWidth(e));
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
        this.toggleClass(document.querySelector(this.navParent), 'show-nav');
    }

    setClickHandlers() {
        document.querySelector(this.moreLink).addEventListener('click', this.handleMoreEvent.bind(this), false);
        document.querySelector(this.collapsedLink).addEventListener('click', this.handleMoreEvent.bind(this), false);
    }

    setWindowListeners() {
        let mql = window.matchMedia(this.breakpoint),
            resizeEvent = this.collapseResponsive.bind(this);

        let mediaQueryResponse = (mql) => {
            // Remove children nodes to re-calculate

            this.removeChildren([
                this.navPrimary,
                this.navOverflow
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
        let navWidth = this.outerWidth(document.querySelector(this.navPrimary)),
            moreWidth = this.outerWidth(this.navItems[this.navItems.length - 1]),
            overflowNavPosition = 0;

        for (let i = 0; i < this.navItems.length; i++) {
            let navItem = this.navItems[i],
                rightEdge = navItem.getAttribute('data-right-edge'),
                totalWidth = parseInt(rightEdge) + moreWidth;

            if (this.hasClass(navItem, this.moreLinkText)) continue;

            // Check if navItem fits in primary nav. If not, move to overflow navigation.
            if (totalWidth <= navWidth) {
                document.querySelector(this.navPrimary).insertBefore(navItem, document.querySelector(this.moreLink));
                overflowNavPosition += parseInt(navItem.getAttribute('data-width'));
            } else {
                document.querySelector(this.navOverflow).appendChild(navItem);
            }
        }

        // Add menu overflow class
        if (document.querySelector('.nav-overflow a')) {
            this.addClass(document.querySelector(this.navParent), 'menu-overflow');
        } else {
            this.removeClass(document.querySelector(this.navParent), 'menu-overflow');
        }

        // Position overflow nav left to align under "more"
        document.querySelector(this.navOverflow).style.left = `${overflowNavPosition}px`;
    }

    // Collapse all navigation items
    collapseAllItems() {

        // Remove inline style on nav overflow
        document.querySelector(this.navOverflow).removeAttribute('style')

        // Remove show-nav and menu-overflow classes
        this.removeClass(document.querySelector(this.navParent), 'menu-overflow');
        this.removeClass(document.querySelector(this.navParent), 'show-nav');

        // Re-apply sorted elements
        for (let i = 0; i < this.navItems.length; i++) {
            if (!this.hasClass(this.navItems[i], this.moreLinkText)) {
                document.querySelector(this.navOverflow).appendChild(this.navItems[i]);
            }
        }

        this.removeClass(document.querySelector(this.navParent), 'menu-overflow');
    }

    /* Helper functions */
    outerWidth(el) {
        let width = el.offsetWidth,
            style = getComputedStyle(el);

        width += parseInt(style.marginLeft) + parseInt(style.marginRight);
        return width;
    }

    outerHeight(el) {
        let height = el.offsetHeight,
            style = getComputedStyle(el);

        height += parseInt(style.marginTop) + parseInt(style.marginBottom);
        return height;
    }

    hasClass(el, className) {
        let classExists;

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
            let classes = el.className.split(' ');
            let existingIndex = classes.indexOf(className);

            if (existingIndex >= 0)
                classes.splice(existingIndex, 1);
            else
                classes.push(className);

            el.className = classes.join(' ');
        }
    }

}