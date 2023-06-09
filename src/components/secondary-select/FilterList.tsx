import {
  CheckBoxOutlineBlankSharp,
  CheckBoxSharp,
  CropFreeSharp,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import _, { toString } from 'lodash';
import { useCallback, useMemo } from 'react';
import { Flipped, Flipper } from 'react-flip-toolkit';

import { LabelFn } from '../../types/data';
import { toggleInArray } from '../utils/toggle-in-array';

export interface FilterListProps<T = string> {
  title?: string;
  values: T[];
  allowed: T[];
  shown: T[];
  selected: T[];
  onSelected: (selected: T[]) => void;
  disabled?: boolean;
  getLabel?: LabelFn<T>;
  getKey?: LabelFn<T>;
}

export const FilterList = <T,>({
  title,
  values,
  allowed,
  shown,
  selected,
  onSelected,
  disabled = false,
  getLabel = toString,
  getKey = toString,
}: FilterListProps<T>) => {
  const allowedLookup = useLookup(allowed);
  const selectedLookup = useLookup(selected);
  const shownLookup = useLookup(shown);

  const sortedValues = useMemo(
    () => sortValues(values, disabled ? null : allowedLookup),
    [values, allowedLookup, disabled]
  );

  const handleChange = useCallback(
    (v: T, checked: boolean) => {
      onSelected?.(toggleInArray(selected, v));
    },
    [onSelected, selected]
  );

  const labelVariant = 'body2';

  const renderOption = (v: T) => {
    const label = getLabel(v);
    const key = getKey(v);

    const controlDisabled = disabled || !allowedLookup.has(v);

    return (
      <Flipped key={key} flipId={key}>
        <Tooltip
          title="Double-click to select one"
          enterNextDelay={2000}
          enterDelay={1000}
          disableInteractive
        >
          <FormControlLabel
            disabled={controlDisabled}
            onDoubleClick={
              controlDisabled
                ? undefined
                : (e) =>
                    onSelected?.(_.union(_.difference(selected, allowed), [v]))
            }
            control={
              <Checkbox
                // data
                checked={disabled || selectedLookup.has(v)}
                indeterminate={disabled}
                indeterminateIcon={<CropFreeSharp />}
                onChange={(e, checked) => handleChange(v, checked)}
                //

                // style
                icon={<CheckBoxOutlineBlankSharp />}
                checkedIcon={<CheckBoxSharp />}
                size="small"
                sx={{
                  marginY: 0,
                  height: (theme) => theme.typography[labelVariant].lineHeight,
                }}
              />
            }
            label={
              <Typography
                variant={labelVariant}
                color={
                  !disabled && shownLookup.has(v)
                    ? 'text.secondary'
                    : 'text.disabled'
                }
                sx={{ userSelect: 'none' }}
              >
                {label}
              </Typography>
            }
            //

            // style
            sx={{ alignItems: 'flex-start', marginY: '0.2em' }}
          />
        </Tooltip>
      </Flipped>
    );
  };

  return (
    <FormControl
      disabled={disabled}
      component="fieldset"
      variant="standard"
      //

      // style
      sx={{
        maxHeight: '100%',
        p: 1,
        bgcolor: '#eaeaea',
        boxSizing: 'border-box',
        width: '100%',
        maxWidth: '400px',
        height: '250px', //TODO: fix flexbox issues and remove hardcoded height
        borderRadius: 2,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'clip',
      }}
      //

      //
    >
      {title && (
        <Box>
          <FormLabel component="legend">{title}</FormLabel>
        </Box>
      )}

      <Box flexGrow={1} sx={{ overflowY: 'scroll' }}>
        <Flipper flipKey={sortedValues.join('-')}>
          <FormGroup>{sortedValues.map(renderOption)}</FormGroup>
        </Flipper>
      </Box>
      <Box
        position="sticky"
        minHeight="1.5em"
        borderTop="1px solid gainsboro"
        display="flex"
        flexDirection="row"
        justifyContent={disabled ? 'end' : 'space-between'}
      >
        {!disabled && (
          <>
            <Typography variant="subtitle2" component="div" color="GrayText">
              {_.intersection(selected, allowed).length}/{allowed.length}
            </Typography>

            <Stack direction="row" justifyContent="end">
              <Button
                size="small"
                disabled={disabled}
                sx={{ textTransform: 'none', padding: 0 }}
                onClick={() => onSelected?.(_.union(selected, allowed))}
              >
                All
              </Button>
              <Button
                size="small"
                disabled={disabled}
                sx={{ textTransform: 'none', padding: 0 }}
                onClick={() => onSelected?.(_.difference(selected, allowed))}
              >
                None
              </Button>
            </Stack>
          </>
        )}
      </Box>
    </FormControl>
  );
};

function useLookup<T>(arr: T[]): Set<T> {
  return useMemo(() => new Set(arr), [arr]);
}

function sortValues<T>(values: T[], allowedSet: Set<T> | null) {
  if (allowedSet == null) return [...values];

  const allowed = [],
    disallowed = [];

  for (const v of values) {
    if (allowedSet.has(v)) {
      allowed.push(v);
    } else {
      disallowed.push(v);
    }
  }
  return allowed.concat(disallowed);
}
