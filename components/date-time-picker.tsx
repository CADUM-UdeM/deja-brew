import React from 'react';
import DateTimePicker from '@react-native-community/datetimepicker';

type PlatformDateTimePickerProps = {
  value: Date;
  mode: 'date' | 'time';
  display?: 'default' | 'spinner' | 'calendar' | 'clock' | 'compact' | 'inline';
  minimumDate?: Date;
  onChange: (event: unknown, date?: Date) => void;
};

export function PlatformDateTimePicker(props: PlatformDateTimePickerProps) {
  return <DateTimePicker {...props} />;
}
