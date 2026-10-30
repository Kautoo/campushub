import { getOrders } from "@/server/db/repository";
import { requireAuth } from "@/server/auth";
import { successResponse, serverErrorResponse, unauthorizedResponse } from "@/server/api-response";

export async function GET(request: Request) {
  try {
    let user;
    try {
      user = await requireAuth(request);
    } catch {
      return unauthorizedResponse("Authentication required to view your orders.");
    }

    const orders = await getOrders({ studentId: user.studentId });
    return successResponse(orders);
  } catch (err) {
    return serverErrorResponse(err, "Failed to retrieve your orders");
  }
}
