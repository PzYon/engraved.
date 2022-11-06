import React from "react";
import { useMetricContext } from "./MetricDetailsContext";
import { MetricType } from "../../serverApi/MetricType";
import { styled, Typography } from "@mui/material";
import { Route, Routes } from "react-router-dom";
import { EditMetricPermissionsLauncher } from "./edit/EditMetricPermissionsLauncher";
import { FormatDate } from "../common/FormatDate";
import { NotesViewPage } from "./notes/NotesViewPage";
import { NotesEditPage } from "./notes/NotesEditPage";
import { MetricViewPage } from "./MetricViewPage";
import { MetricEditPage } from "./edit/MetricEditPage";

export const MetricDetails: React.FC = () => {
  const { metric } = useMetricContext();

  if (!metric) {
    return null;
  }

  return (
    <>
      <Typography component="div">
        <PropertiesContainer>
          {metric.editedOn ? (
            <PropertyContainer>
              Edited <FormatDate value={metric.editedOn} />
            </PropertyContainer>
          ) : null}
          {metric.description ? (
            <PropertyContainer>{metric.description}</PropertyContainer>
          ) : null}
        </PropertiesContainer>
      </Typography>

      <Routes>
        {metric.type === MetricType.Notes ? (
          <>
            <Route path="/" element={<NotesViewPage />} />
            <Route path="/edit" element={<NotesEditPage />} />
          </>
        ) : (
          <>
            <Route path="/" element={<MetricViewPage />} />
            <Route path="/edit" element={<MetricEditPage />} />
          </>
        )}
        <Route
          path="/permissions"
          element={<EditMetricPermissionsLauncher metric={metric} />}
        />
      </Routes>
    </>
  );
};

const PropertiesContainer = styled("div")`
  padding: 0 ${(p) => p.theme.spacing(2)};

  & > span:not(:last-of-type)::after {
    content: "\\00B7";
    margin: 0 ${(p) => p.theme.spacing(2)};
  }
`;

const PropertyContainer = styled("span")``;
