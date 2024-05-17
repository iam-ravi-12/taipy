/*
 * Copyright 2021-2024 Avaiga Private Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import React, {CSSProperties, lazy, Suspense, useMemo} from 'react';
import {Data} from "plotly.js";
import {useClassNames, useDynamicJsonProperty, useDynamicProperty} from "../../utils/hooks";
import {TaipyBaseProps, TaipyHoverProps} from "./utils";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";

const Plot = lazy(() => import("react-plotly.js"));

interface MetricProps extends TaipyBaseProps, TaipyHoverProps {
    type?: string
    min?: number
    max?: number
    value?: number
    defaultValue?: number
    delta?: number
    defaultDelta?: number
    threshold?: number
    defaultThreshold?: number
    testId?: string
    defaultLayout?: string;
    layout?: string;
    defaultStyle?: string;
    style?: string;
    width?: string | number;
    height?: string | number;
}

const emptyLayout = {} as Record<string, Record<string, unknown>>;
const defaultStyle = {position: "relative", display: "inline-block"};

const Metric = (props: MetricProps) => {
    const {
        width = "100%",
        height
    } = props;
    const value = useDynamicProperty(props.value, props.defaultValue, 0)
    const threshold = useDynamicProperty(props.threshold, props.defaultThreshold, undefined)
    const delta = useDynamicProperty(props.delta, props.defaultDelta, undefined)
    const className = useClassNames(props.libClassName, props.dynamicClassName, props.className);
    const baseLayout = useDynamicJsonProperty(props.layout, props.defaultLayout || "", emptyLayout);
    const baseStyle = useDynamicJsonProperty(props.style, props.defaultStyle || "", defaultStyle);

    const data = useMemo(() => ([
        {
            domain: {x: [0, 1], y: [0, 1]},
            value: value,
            type: "indicator",
            mode: (() => {
                let mode = "gauge+number";
                if (delta !== undefined) mode += "+delta";
                return mode;
            })(),
            delta: {
                reference: typeof threshold === 'number' && typeof delta === 'number' ? threshold - delta : undefined,
            },
            gauge: {
                axis: {range: [
                    typeof props.min === 'number' ? props.min : 0,
                    typeof props.max === 'number' ? props.max : 100
                    ]},
                shape: props.type === "linear" ? "bullet" : "angular",
                threshold: {
                    line: {color: "red", width: 4},
                    thickness: 0.75,
                    value: threshold
                }
            },
        }
    ]), [
        props.min,
        props.max,
        props.type,
        value,
        threshold,
        delta
    ]);

    const style = useMemo(
        () =>
            height === undefined
                ? ({...baseStyle, width: width} as CSSProperties)
                : ({...baseStyle, width: width, height: height} as CSSProperties),
        [baseStyle, height, width]
    );

    return (
        <Box data-testid={props.testId} className={className}>
            <Suspense fallback={<Skeleton key="skeleton"/>}>
                <Plot
                    data={data as Data[]}
                    layout={baseLayout}
                    style={style}
                />
            </Suspense>
        </Box>
    );
}

export default Metric;
