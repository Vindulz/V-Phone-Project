const userId = localStorage.getItem("userId");

console.log("userId:", localStorage.getItem("userId"));

function formatPrice(price) {
    return "Rp. " + Number(price).toLocaleString("id-ID");
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

async function loadHistory() {
    if (!userId) {
        document.getElementById("empty-msg").textContent = "Please login to view your order history.";
        return;
    }

    try {
        const res = await fetch(`http://${window.location.hostname}:3000/api/orders/history?userId=${userId}`);
        const orders = await res.json();

        const list = document.getElementById("history-list");
        const emptyMsg = document.getElementById("empty-msg");

        if (!orders || orders.length === 0) {
            emptyMsg.style.display = "block";
            return;
        }

        emptyMsg.style.display = "none";
        list.innerHTML = "";

        // Group by minute — orders placed within the same minute = same session
        const groups = [];
        let currentGroup = null;
        let currentMinute = null;

        orders.forEach(order => {
            const date = new Date(order.orderedAt);
            // Round down to the minute as session key
            const minuteKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}`;

            if (minuteKey !== currentMinute) {
                currentMinute = minuteKey;
                currentGroup = { date: order.orderedAt, items: [] };
                groups.push(currentGroup);
            }
            currentGroup.items.push(order);
        });

        // Render each group
        groups.forEach((group, groupIndex) => {
            // Session header
            const separator = document.createElement("div");
            separator.classList.add("date-separator");
            separator.textContent = `Order #${groups.length - groupIndex} — ${formatDate(group.date)}`;
            list.appendChild(separator);

            // Group total
            const groupTotal = group.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

            // Items
            group.items.forEach(order => {
                const card = document.createElement("div");
                card.classList.add("order-card");
                card.innerHTML = `
                    <div class="order-card-info">
                        <h3>${order.productName}</h3>
                        <p class="order-qty">Qty: ${order.quantity}</p>
                        <p class="order-unit-price">${formatPrice(order.price)} / unit</p>
                    </div>
                    <div class="order-card-total">
                        <span class="order-subtotal">${formatPrice(Number(order.price) * order.quantity)}</span>
                        <span class="order-status">Placed</span>
                    </div>
                `;
                list.appendChild(card);
            });

            // Session total row
            const totalRow = document.createElement("div");
            totalRow.classList.add("group-total");
            totalRow.innerHTML = `<span>Order Total</span><span>${formatPrice(groupTotal)}</span>`;
            list.appendChild(totalRow);
        });

    } catch (err) {
        document.getElementById("empty-msg").textContent = "Could not load order history. Is the server running?";
    }
}

loadHistory();