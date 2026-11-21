import { getDashboardSummary } from "../services/dashboardService.js";

export const getDashboard = async (req, res) => {
  const summary = await getDashboardSummary(req.user.id);

  res.status(200).json({
    success: true,
    message: "Dashboard summary fetched successfully",
    data: summary,
  });
};