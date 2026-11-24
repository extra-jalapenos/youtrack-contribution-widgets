import { InternMap } from "d3";

type relativeTimeframe = {
    amount: number;
    unit: "days" | "weeks" | "months" | "years";
}

export type WidgetConfiguration = {
    title: string;
    query: string;
    binSize: number;
    groupWorkItemsBy: "id" | "day" | "week" | "month" | "quarter" | "year";
    timeframeStartOffsetAmount: number;
    timeframeStartOffsetUnit: "day" | "week" | "month" | "quarter" | "year";
    timeframeEndOffsetAmount: number;
    timeframeEndOffsetUnit: "day" | "week" | "month" | "quarter" | "year";
}

export type ChartData = InternMap<number, number>

export type ChartConfig = {
    viewBoxWidth?: number,
    viewBoxHeight?: number,
    data: ChartData,
    width: number,
    height: number,
    binWidthMinutes: number,
    maxX: number,
    maxY: number,
}
