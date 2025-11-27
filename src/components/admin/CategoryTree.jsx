import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Collapse,
  IconButton,
  Chip,
  Typography
} from '@mui/material';
import {
  ExpandMore,
  ChevronRight,
  DragIndicator
} from '@mui/icons-material';

/**
 * CategoryTree component displays hierarchical category structure.
 * Supports drag-and-drop reordering (requires react-beautiful-dnd or @dnd-kit).
 */
const CategoryTree = ({ categories, onSelectCategory, selectedCategoryId, onReorder }) => {
  const [expandedCategories, setExpandedCategories] = useState(new Set());

  const handleToggleExpand = (categoryId) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderCategory = (category, level = 0) => {
    const hasChildren = category.subCategories && category.subCategories.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isSelected = selectedCategoryId === category.id;

    return (
      <Box key={category.id}>
        <ListItem
          disablePadding
          sx={{
            pl: level * 3,
            bgcolor: isSelected ? 'action.selected' : 'transparent'
          }}
          secondaryAction={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {!category.isActive && (
                <Chip label="Inactive" size="small" color="warning" />
              )}
              <IconButton
                edge="end"
                size="small"
                sx={{ cursor: 'grab' }}
                title="Drag to reorder"
              >
                <DragIndicator fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          {hasChildren && (
            <IconButton
              size="small"
              onClick={() => handleToggleExpand(category.id)}
              sx={{ mr: 1 }}
            >
              {isExpanded ? <ExpandMore /> : <ChevronRight />}
            </IconButton>
          )}
          {!hasChildren && <Box sx={{ width: 40 }} />}
          <ListItemButton
            onClick={() => onSelectCategory(category)}
            sx={{ borderRadius: 1 }}
          >
            <ListItemText
              primary={category.name}
              secondary={category.description}
              primaryTypographyProps={{
                fontWeight: isSelected ? 600 : 400,
                color: category.isActive ? 'text.primary' : 'text.disabled'
              }}
              secondaryTypographyProps={{
                noWrap: true,
                color: category.isActive ? 'text.secondary' : 'text.disabled'
              }}
            />
          </ListItemButton>
        </ListItem>
        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List disablePadding>
              {category.subCategories.map((subCategory) =>
                renderCategory(subCategory, level + 1)
              )}
            </List>
          </Collapse>
        )}
      </Box>
    );
  };

  if (!categories || categories.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No categories available
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', bgcolor: 'background.paper', borderRadius: 1 }}>
      <List disablePadding>
        {categories.map((category) => renderCategory(category))}
      </List>
    </Box>
  );
};

CategoryTree.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      name: PropTypes.string.isRequired,
      description: PropTypes.string,
      isActive: PropTypes.bool.isRequired,
      subCategories: PropTypes.array
    })
  ).isRequired,
  onSelectCategory: PropTypes.func.isRequired,
  selectedCategoryId: PropTypes.number,
  onReorder: PropTypes.func
};

export default CategoryTree;
