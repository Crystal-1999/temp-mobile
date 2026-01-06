document.addEventListener("DOMContentLoaded", function () {
    const payNowBtn = document.getElementById("payNowBtn");

    if (!payNowBtn) {
        console.error("Pay Now button not found in the DOM.");
        return; // Exit script if button is missing
    }

    const amountButtons = document.querySelectorAll(".amount-btn");
    const amountInput = document.getElementById("customAmount");

    let selectedAmount = 0;
    let isProcessing = false; // Flag to prevent multiple clicks

    // When a user clicks an amount button
    amountButtons.forEach(button => {
        button.addEventListener("click", function () {
            selectedAmount = parseFloat(this.getAttribute("data-amount")) || 0;
            if (amountInput) {
                amountInput.value = selectedAmount;
            }
        });
    });

    // When user enters an amount manually
    if (amountInput) {
        amountInput.addEventListener("input", function () {
            selectedAmount = parseFloat(this.value) || 0;
        });
    }

    payNowBtn.addEventListener("click", async function () {
        if (isProcessing) {
            // Payment already being processed
            return; // Exit if a payment is already being processed
        }

        isProcessing = true; // Set flag to true
        payNowBtn.disabled = true; // Disable the button to prevent multiple clicks

        // Amount selected

        // Validate amount
        if (!selectedAmount || selectedAmount <= 0) {
            showWarningToast("Please select or enter an amount to add funds.");
            isProcessing = false;
            payNowBtn.disabled = false;
            return;
        }

        // Ensure customerId is defined
        if (!customerId) {
            console.error("Customer ID is not defined.");
            showErrorToast("You are not logged in. Please log in again.");
            setTimeout(() => {
                window.location.href = '/app/login';
            }, 1500);
            isProcessing = false;
            payNowBtn.disabled = false;
            return;
        }

        try {
            const response = await fetch("/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: selectedAmount, customerId: customerId }) // Use the rendered customerId
            });

            const data = await response.json();

            if (data.sessionId) {
                const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
                stripe.redirectToCheckout({ sessionId: data.sessionId });

                // Update the UI with the new balance returned from the payment route
                const balanceElement = document.getElementById("walletBalance");
                if (balanceElement && data.balance !== undefined) {
                    balanceElement.innerText = `$${data.balance.toFixed(2)}`;
                }
            } else {
                showErrorToast("Payment initiation failed. Please try again.");
            }
        } catch (error) {
            console.error("Error:", error);
        } finally {
            isProcessing = false; // Reset flag
            payNowBtn.disabled = false; // Re-enable the button
        }
    });
});