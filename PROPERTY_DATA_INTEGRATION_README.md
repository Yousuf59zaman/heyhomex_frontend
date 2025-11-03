# Property Data Integration README

This document explains the new property data flow introduced in the current branch. The goal is to replace hard-coded property cards across the citizen-facing pages with data fetched from the CMS and to centralise that behaviour in a reusable Nuxt composable.

## Key Additions

### 1. `app/composables/useProperties.ts`
A reusable Nuxt composable that:
- Fetches property data from the `/property` CMS endpoint via `$fetchCMS`
- Normalises backend responses into the frontend `Property` interface using `transformProperty()`
- Maintains reactive state: `properties`, `loading`, and `error` refs
- Provides utility methods:
  - `fetchProperties()` - Fetches all properties from the API
  - `getPropertiesLimit(limit)` - Returns a subset of properties
  - `toggleFavorite(propertyId)` - Toggles favorite status for a property

### 2. `app/types/property.ts`
TypeScript type definitions including:
- `PropertyApiResponse` - Backend API response structure (snake-case fields like 'square-feet')
- `Property` - Frontend property interface (camelCase fields like 'sqft')
- `PropertyListResponse` - API response wrapper (for potential future use)

## Component Updates

### Search Component (`app/components/Search/Property.vue`)
Major changes to support dynamic data and multi-segment routing:

1. **Segment Prop**: Accepts a `segment` prop ('military', 'investor', or 'kamaina') to determine navigation paths
2. **Dynamic Property Data**: Replaced hardcoded property array with `useProperties()` composable
3. **Map Marker Coordinates**: Added `propertiesWithCoordinates` computed property that assigns default Hawaii coordinates to properties for map display (since CMS doesn't provide coordinates)
4. **Async Initialization**: Calls `fetchProperties()` in `onMounted` to load data from CMS
5. **Loading & Error States**: Added UI states for loading and error scenarios
6. **Dynamic Navigation**: Updates `handlePropertyClick` to use segment-aware routing (`/${segment}/property/${id}`)
7. **Favorite Toggle**: Integrated with composable's `toggleFavorite` method

Coordinate handling:
```javascript
const propertiesWithCoordinates = computed(() => {
    const defaultCoordinates = [
        [20.7984, -156.3319], // Maui
        [21.3099, -157.8581], // Honolulu
        [22.0964, -159.5261], // Kauai
        [19.7297, -155.0900], // Hilo
        // ... more coordinates
    ];

    return properties.value.map((property, index) => ({
        ...property,
        coordinates: defaultCoordinates[index % defaultCoordinates.length]
    }));
});
```

## Page Updates

### Index Pages
The following pages now consume `useProperties` instead of static arrays:
- `app/pages/investor/index.vue`
- `app/pages/kamaina/index.vue`
- `app/pages/military/index.vue`

Each page implements the same pattern:

1. **Composable Integration**:
   ```javascript
   const { properties, loading, error, fetchProperties, toggleFavorite } = useProperties()
   ```

2. **Data Fetching**: Calls `fetchProperties()` inside `onMounted`

3. **UI States**: Displays loading spinner and error messages before rendering property grid

4. **Navigation**: Updates `handlePropertyClick` to route to segment-specific paths:
   - `/investor/property/${id}`
   - `/kamaina/property/${id}`
   - `/military/property/${id}`

5. **Favorite Handling**: Uses composable's `toggleFavorite(propertyId)` instead of local state manipulation

6. **Search Navigation**: Fixed navigation paths to use correct segment (e.g., `/military/search` instead of hardcoded `/kamaina/search`)

### Search Pages
The following search pages were updated to pass segment prop:
- `app/pages/investor/search.vue` → `<SearchProperty segment="investor" />`
- `app/pages/kamaina/search.vue` → `<SearchProperty segment="kamaina" />`
- `app/pages/military/search.vue` → `<SearchProperty segment="military" />`

This ensures the Search component correctly routes users based on their active segment.

## Data Flow

```
CMS API (/property)
    ↓
useProperties() composable
    ↓ (transforms PropertyApiResponse → Property)
    ↓
Pages (index.vue) & Components (Search/Property.vue)
    ↓
CommonCitizenPropertyGrid / CommonCitizenPropertyCard
```

## Field Mapping

| Backend Field (API) | Frontend Field |
|---------------------|----------------|
| name                | title          |
| address             | address        |
| price               | price          |
| beds                | beds           |
| baths               | baths          |
| square-feet         | sqft           |
| image               | image          |
| (generated)         | id             |
| (default: false)    | isFavorited    |

## Implementation Notes

### ID Generation
The backend does not return an `id` field, so the composable generates sequential IDs based on array index:
```javascript
id: index + 1
```
⚠️ **Important**: Replace this logic when the API provides stable identifiers to prevent issues with data updates.

### Favorites
- Favorites are stored in-memory only (not persisted)
- State resets on page refresh
- Future enhancement: Persist to localStorage or backend user preferences

### Map Coordinates
- CMS doesn't provide property coordinates
- Default Hawaii coordinates are assigned in a round-robin fashion
- Future enhancement: Add coordinates to CMS or use geocoding service

### Error Handling
- All network errors are caught and stored in `error` ref
- Components display user-friendly error messages
- Console logs provide debugging information

## Testing Checklist

- [ ] Properties load correctly on all three segment pages (investor, kamaina, military)
- [ ] Loading state displays during fetch
- [ ] Error state displays on API failure
- [ ] Map view shows correct markers with coordinates
- [ ] Property click navigates to correct segment-specific detail page
- [ ] Favorite toggle works and persists within session
- [ ] Search page navigation maintains correct segment context

## Next Steps

1. **API Enhancement**: Request stable `id` field from backend to replace index-based IDs
2. **Coordinate Data**: Add property coordinates to CMS or integrate geocoding service for accurate map markers
3. **Favorites Persistence**: Implement localStorage or backend storage for favorite properties
4. **Query Parameters**: Extend composable to support search, filters, and pagination when API supports them
5. **Component Tests**: Write unit tests for loading/error handling in pages and Search component
6. **Shared Logic**: Consider extracting repeated page logic into a shared composable or layout if additional segments are added
7. **Type Safety**: Add runtime validation for API responses to catch schema changes early

