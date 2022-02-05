import React from "react";
import { MetricList } from "./components/MetricList";
import { BrowserRouter, Link, Route, Routes } from "react-router-dom";
import { MetricDetails } from "./components/MetricDetails";
import { AddMetric } from "./components/AddMetric";
import { Typography } from "@mui/material";
import { PageLayout } from "./components/layout/PageLayout";

export const App: React.FC = () => (
  <BrowserRouter>
    <PageLayout>
      <Link to="/">
        <Typography variant="h2">metrix</Typography>
      </Link>
      <Routes>
        <Route path="/" element={<MetricList />} />
        <Route path="/metrics/create" element={<AddMetric />} />
        <Route path="/metrics/view/:metricKey/*" element={<MetricDetails />} />
      </Routes>
    </PageLayout>
  </BrowserRouter>
);
