(function () {
    const username = localStorage.getItem("username");
    const userId = localStorage.getItem("userId");
    const role = localStorage.getItem("role");

    const navUsername = document.getElementById("nav-username");
    const cartCount = document.getElementById("nav-cart-count");

    // ─── Notification badge & fetching ───────────────────────────────────────

    let allNotifications = [];

    async function fetchNotifications() {
    if (!userId) return [];
    try {
        const token = localStorage.getItem('token');
        const isAdmin = role === 'admin';
        const url = isAdmin
            ? `http://${window.location.hostname}:3000/notifications/admin`
            : `http://${window.location.hostname}:3000/notifications/user/me`;

        const res = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });
        const data = await res.json();
        allNotifications = Array.isArray(data) ? data : [];
        return allNotifications;
    } catch {
        return [];
    }
}

    function getUnreadCount(notifications) {
        return notifications.filter(n => !n.isRead).length;
    }

   
    function updateBadge(count) {
        const badge = document.getElementById("notif-badge");
        const inlineBadge = document.getElementById("notif-inline-badge");

        if (badge) {
            if (count > 0) {
                badge.textContent = count > 99 ? "99+" : count;
                badge.style.display = "flex";
            } else {
                badge.style.display = "none";
            }
        }

        if (inlineBadge) {
            if (count > 0) {
                inlineBadge.textContent = count > 99 ? "99+" : count;
                inlineBadge.style.display = "flex";
            } else {
                inlineBadge.style.display = "none";
            }
        }
    }

    async function markAsRead(id) {
    const token = localStorage.getItem('token');
    await fetch(`http://${window.location.hostname}:3000/notifications/${id}/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
    });  
    const notif = allNotifications.find(n => n.id === id);
    if (notif) notif.isRead = true;
    updateBadge(getUnreadCount(allNotifications));
    renderNotifList();
}

async function markAllRead() {
    const token = localStorage.getItem('token');
    const isAdmin = role === 'admin';
    const url = isAdmin
        ? `http://${window.location.hostname}:3000/notifications/admin/read-all`
        : `http://${window.location.hostname}:3000/notifications/user/me/read-all`;
    await fetch(url, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
    });
    allNotifications.forEach(n => (n.isRead = true));
    updateBadge(0);
    renderNotifList();
}

    function timeAgo(dateStr) {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    }

    function getNotifIcon(type) {
        if (type === "checkout") return `<img src="assets/Check.png" style="width:18px;height:18px;object-fit:contain;">`;
        if (type === "low_stock") return `<img src="assets/WarnLogo.png" style="width:18px;height:18px;object-fit:contain;">`;
        return `<img src="assets/Check.png" style="width:18px;height:18px;object-fit:contain;">`;
    }

    function renderNotifList() {
        const list = document.getElementById("notif-list");
        if (!list) return;

        if (allNotifications.length === 0) {
            list.innerHTML = `<div style="padding:1.5rem 1rem;text-align:center;color:#aaa;font-size:0.85rem;">No notifications yet</div>`;
            return;
        }

        list.innerHTML = allNotifications.map(n => `
            <div class="notif-item ${n.isRead ? "read" : "unread"}" data-id="${n.id}">
                <span class="notif-icon">${getNotifIcon(n.type)}</span>
                <div class="notif-body">
                    <p class="notif-msg ${n.isRead ? "read" : ""}">${n.message}</p>
                    <span class="notif-time">${timeAgo(n.createdAt)}</span>
                </div>
                ${!n.isRead ? `<button class="notif-dot" title="Mark as read" data-id="${n.id}"></button>` : ""}
            </div>
        `).join("");

        list.querySelectorAll(".notif-dot").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                markAsRead(Number(btn.dataset.id));
            });
        });
    }

    // ─── Navbar build ─────────────────────────────────────────────────────────

    if (navUsername) {
        
        const nameText = document.createElement("span");
        nameText.textContent = username ? `Hello, ${username}!` : "Hello, Guest!";

        // Clear the element and rebuild with wrapper
        navUsername.textContent = "";
        navUsername.style.cursor = "pointer";
        navUsername.style.userSelect = "none";
        navUsername.style.position = "relative";
        navUsername.style.display = "inline-flex";
        navUsername.style.alignItems = "center";
        navUsername.style.gap = "6px";

        const badge = document.createElement("span");
        badge.id = "notif-badge";
        badge.style.cssText = `
            display: none;
            align-items: center;
            justify-content: center;
            background: #e74c3c;
            color: white;
            font-size: 0.65rem;
            font-weight: 700;
            font-family: 'Lexend', sans-serif;
            min-width: 18px;
            height: 18px;
            border-radius: 999px;
            padding: 0 4px;
            pointer-events: none;
            box-shadow: 0 1px 4px rgba(231,76,60,0.4);
            flex-shrink: 0;
        `;

        navUsername.appendChild(nameText);
        navUsername.appendChild(badge);

        const dropdown = document.createElement("div");
        dropdown.id = "user-dropdown";
        dropdown.style.cssText = `
            display: none;
            position: absolute;
            top: 2rem;
            right: 0;
            background: white;
            border-radius: 0.5rem;
            box-shadow: 0 0.5rem 1.5rem rgba(0,0,0,0.15);
            min-width: 11rem;
            z-index: 1000;
            overflow: hidden;
            flex-direction: column;
        `;

        // ── Panel notif──
        const notifWrapper = document.createElement("div");
        notifWrapper.id = "notif-wrapper";
        notifWrapper.style.cssText = `
            display: none;
            position: fixed;
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 0.5rem 2rem rgba(0,0,0,0.18);
            width: 22rem;
            z-index: 1001;
            overflow: hidden;
            flex-direction: column;
        `;

        notifWrapper.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:0.85rem 1rem 0.6rem;border-bottom:1px solid #eee;">
                <span style="font-family:'Lexend',sans-serif;font-weight:700;font-size:0.95rem;color:#002373;">Notifications</span>
                <button id="mark-all-read" style="background:none;border:none;cursor:pointer;font-family:'Lexend',sans-serif;font-size:0.75rem;font-weight:600;color:#133877;padding:0;">Mark all read</button>
            </div>
            <div id="notif-list" style="max-height:18rem;overflow-y:auto;"></div>
        `;

        document.body.appendChild(notifWrapper);

        // ── Dropdown links ──
        const historyLink = document.createElement("a");
        historyLink.href = "OrderHistory.html";
        historyLink.textContent = "Order History";

        const hr1 = document.createElement("hr");
        hr1.style.cssText = "margin: 0; border: none; border-top: 1px solid #eee;";

        const notifLink = document.createElement("a");
        notifLink.href = "#";
        notifLink.id = "notif-dropdown-link";
        notifLink.style.cssText = "display:flex;align-items:center;justify-content:space-between;";

        const notifLabel = document.createElement("span");
        notifLabel.textContent = "Notifications";

        const notifInlineBadge = document.createElement("span");
        notifInlineBadge.id = "notif-inline-badge";
        notifInlineBadge.style.cssText = `
            display: none;
            background: #e74c3c;
            color: white;
            font-size: 0.65rem;
            font-weight: 700;
            min-width: 18px;
            height: 18px;
            border-radius: 999px;
            padding: 0 4px;
            align-items: center;
            justify-content: center;
        `;

        notifLink.appendChild(notifLabel);
        notifLink.appendChild(notifInlineBadge);

        const hrNotif = document.createElement("hr");
        hrNotif.style.cssText = "margin: 0; border: none; border-top: 1px solid #eee;";

        if (role === "admin") {
            const adminLink = document.createElement("a");
            adminLink.href = "Admin.html";
            adminLink.textContent = "Admin Dashboard";
            adminLink.style.color = "#133877";
            const hrAdmin = document.createElement("hr");
            hrAdmin.style.cssText = "margin: 0; border: none; border-top: 1px solid #eee;";
            dropdown.appendChild(hrAdmin);
            dropdown.appendChild(adminLink);
        }

        const hr2 = document.createElement("hr");
        hr2.style.cssText = "margin: 0; border: none; border-top: 1px solid #eee;";

        const editProfileLink = document.createElement("a");
        editProfileLink.href = "EditProfile.html";
        editProfileLink.textContent = "Edit Profile";

        const hr3 = document.createElement("hr");
        hr3.style.cssText = "margin: 0; border: none; border-top: 1px solid #eee;";

        const logoutLink = document.createElement("a");
        logoutLink.href = "#";
        logoutLink.textContent = "Log Out";
        logoutLink.style.color = "#e74c3c";

        logoutLink.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            localStorage.removeItem("token");
            localStorage.removeItem("userId");
            localStorage.removeItem("username");
            localStorage.removeItem("role");
            window.location.href = "Login.html";
        });

        dropdown.appendChild(historyLink);
        dropdown.appendChild(hr1);
        dropdown.appendChild(notifLink);
        dropdown.appendChild(hrNotif);
        dropdown.appendChild(editProfileLink);
        dropdown.appendChild(hr2);
        dropdown.appendChild(logoutLink);
        navUsername.appendChild(dropdown);

        // ── Styles ──
        const style = document.createElement("style");
        style.textContent = `
            #user-dropdown a {
                display: flex;
                align-items: center;
                padding: 0.75rem 1.25rem;
                font-family: 'Lexend', sans-serif;
                font-size: 0.9rem;
                font-weight: 600;
                color: #002373;
                text-decoration: none;
                transition: background 0.2s ease;
                white-space: nowrap;
                margin: 0 !important;
            }
            #user-dropdown a:hover { background-color: #f0f4ff; }
            #user-dropdown a::after { display: none !important; }

            .notif-item {
                display: flex;
                align-items: flex-start;
                gap: 0.6rem;
                padding: 0.75rem 1rem;
                border-bottom: 1px solid #f3f3f3;
                transition: background 0.15s;
                cursor: default;
            }
            .notif-item:last-child { border-bottom: none; }
            .notif-item.unread { background: #f6f9ff; }
            .notif-item.read { background: white; }
            .notif-item:hover { background: #eef3ff; }
            .notif-icon { font-size: 1.1rem; margin-top: 1px; flex-shrink: 0; }
            .notif-body { flex: 1; min-width: 0; }
            .notif-msg {
                margin: 0 0 0.2rem;
                font-family: 'Lexend', sans-serif;
                font-size: 0.8rem;
                font-weight: 500;
                color: #1a1a2e;
                line-height: 1.4;
                word-break: break-word;
            }
           
            .notif-msg.read {
                color: #aaa;
                font-weight: 400;
            }
            .notif-time {
                font-family: 'Lexend', sans-serif;
                font-size: 0.7rem;
                color: #aaa;
            }
            .notif-dot {
                width: 10px;
                height: 10px;
                border-radius: 50%;
                background: #133877;
                border: none;
                cursor: pointer;
                flex-shrink: 0;
                margin-top: 4px;
                transition: background 0.2s;
            }
            .notif-dot:hover { background: #e74c3c; }
            #notif-list::-webkit-scrollbar { width: 4px; }
            #notif-list::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
        `;
        document.head.appendChild(style);

        // ── Toggle dropdown menu ──
        navUsername.addEventListener("click", function (e) {
            e.stopPropagation();
            const isVisible = dropdown.style.display === "flex";
            dropdown.style.display = isVisible ? "none" : "flex";
            dropdown.style.flexDirection = "column";
            notifWrapper.style.display = "none";
        });

        // ── Toggle notif panel dari dropdown link ──
        notifLink.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            dropdown.style.display = "none";
            const isVisible = notifWrapper.style.display === "flex";
            notifWrapper.style.display = isVisible ? "none" : "flex";
            notifWrapper.style.flexDirection = "column";

            const rect = navUsername.getBoundingClientRect();
            notifWrapper.style.top = (rect.bottom + 8) + "px";
            notifWrapper.style.right = (window.innerWidth - rect.right) + "px";
        });

        // ── Mark all read button ──
        document.addEventListener("click", function (e) {
            if (e.target && e.target.id === "mark-all-read") {
                e.stopPropagation();
                markAllRead();
            }
        });

        document.addEventListener("click", function () {
            dropdown.style.display = "none";
            notifWrapper.style.display = "none";
        });

        // ── Load notifications ──
        if (userId) {
            fetchNotifications().then(notifs => {
                updateBadge(getUnreadCount(notifs));
                renderNotifList();
            });
        }
    }

    // ─── Cart count ───────────────────────────────────────────────────────────

    if (cartCount && userId) {
        fetch(`http://${window.location.hostname}:3000/api/orders/cart?userId=${userId}`)
            .then(res => res.json())
            .then(items => { cartCount.textContent = items.length || 0; })
            .catch(() => { cartCount.textContent = "0"; });
    }
})();