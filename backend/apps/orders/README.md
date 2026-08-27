# apps/orders/

Handles the core ordering flow.

Will contain:
- Order creation (Dine-in / Takeaway / Online)
- Order status flow: Placed -> Confirmed -> Preparing -> Ready -> Served/Delivered/Picked Up -> Completed
- Kitchen queue logic + AI prep-time estimate hook (Grok)
- Customer "order is late" messaging + admin reply
