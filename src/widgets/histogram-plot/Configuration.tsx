/* eslint-disable no-console */
import React, { memo, useState } from 'react';
import Input from '@jetbrains/ring-ui-built/components/input/input';
import Button from '@jetbrains/ring-ui-built/components/button/button';
import ButtonSet from '@jetbrains/ring-ui-built/components/button-set/button-set';
import type {WidgetConfiguration} from './types.d.ts';
import Heading from '@jetbrains/ring-ui-built/components/heading/heading.js';
import ButtonGroup from '@jetbrains/ring-ui-built/components/button-group/button-group.js';
import { readableDuration, timeAggregationOptions } from '../../utils/constants.ts';
import ControlLabel from '@jetbrains/ring-ui-built/components/control-label/control-label.js';

interface Props {
    onDone: (config?: WidgetConfiguration) => void;
    currentConfiguration?: WidgetConfiguration;
}
const ConfigurationComponent: React.FunctionComponent<Props> = ({
    onDone, 
    currentConfiguration
  }) => {
    const [config, setConfig] = useState<WidgetConfiguration>(
      {
        title: '',
        query: 'has: work',
        binSize: 15,
        groupWorkItemsBy: "week",
        timeframeStartOffsetAmount: -3,
        timeframeStartOffsetUnit: "month",
        timeframeEndOffsetAmount: 1,
        timeframeEndOffsetUnit: "day",
        ...currentConfiguration
      }
    );

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setConfig({
            ...config,
            [e.target.name]: e.target.value
        });
    }

    const onSubmit = (e?: React.SyntheticEvent) => {
        console.info("submitting start")
        e?.preventDefault();
        console.info("submitting after prevent default")
        onDone(config);
    }

    return (
      <form className="ring-form" onSubmit={onSubmit}>
        <Heading level={Heading.Levels.H2}>Widget Configuration</Heading>
        <div className="ring-form__group">
          <Input
            label="Widget Title"
            name="title"
            value={config.title}
            onChange={onChange}
            autoFocus
          />
        </div>
        
        <div className="ring-form__group">
          <Input
            label="query"
            placeholder="has: work"
            name="query"
            value={config.query}
            onChange={onChange}
          />
        </div>
        
        <div className="ring-form__group">
          <ControlLabel>Group work items by</ControlLabel>
          <ButtonGroup>
            {Array.from(timeAggregationOptions.keys()).map((key) => {
              return (
                <Button
                  key={key}
                  value={key}
                  onClick={() => setConfig({ ...config, "groupWorkItemsBy": key as WidgetConfiguration["groupWorkItemsBy"] })}
                  active={key === config.groupWorkItemsBy}
                >
                  {key}
                </Button>
              )
            })}
          </ButtonGroup>
        </div>

        
        <div className="ring-form__group">
          <ButtonGroup>
            {[15, 30, 60, 120, 240, 480, 24 * 60 ].map((minutes) => {
              return (
                <Button
                  key={minutes}
                  value={minutes}
                  onClick={() => setConfig({ ...config, "binSize": minutes })}
                  active={minutes === config.binSize}
                >
                  {readableDuration(minutes)}
                </Button>
              )
            })}
          </ButtonGroup>
        </div>

        <div className="ring-form__group">
          <ButtonSet className="config-buttons">
            <Button primary onClick={onSubmit} disabled={false}>{'Save'}</Button>
            <Button onClick={() => onDone()}>{'Cancel'}</Button>
          </ButtonSet>
        </div>
      </form>
    );
};

const Configuration = memo(ConfigurationComponent);

export default Configuration;