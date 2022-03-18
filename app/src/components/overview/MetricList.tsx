import React, { useEffect, useState } from "react";
import { IMetric } from "../../serverApi/IMetric";
import { MetricListItem } from "./MetricListItem";
import { ServerApi } from "../../serverApi/ServerApi";
import { Grid, Typography } from "@mui/material";
import { GridItem } from "./GridItem";
import { translations } from "../../i18n/translations";
import { Section } from "../layout/Section";
import { useAppContext } from "../../AppContext";

export const MetricList: React.FC = () => {
  const [metrics, setMetrics] = useState<IMetric[]>([]);

  const { setAppAlert } = useAppContext();

  useEffect(() => {
    ServerApi.getMetrics()
      .then((data) => {
        setMetrics(data);
      })
      .catch((e) => {
        setAppAlert({
          title: e.message,
          message: e.message,
          type: "error",
        });
      });
  }, []);

  return (
    <Section>
      <Grid container rowSpacing={2} columnSpacing={2}>
        <GridItem reactKey={"add"} key={"add"} targetUrl={"/metrics/create"}>
          <Typography variant={"h4"}>+</Typography>
          <Typography variant={"subtitle1"}>{translations.create}</Typography>
        </GridItem>
        {metrics.map((m) => (
          <GridItem
            reactKey={m.key}
            key={m.key}
            targetUrl={`/metrics/view/${m.key}`}
          >
            <MetricListItem metric={m} />
          </GridItem>
        ))}
      </Grid>
    </Section>
  );
};
