import * as THREE from 'three';

/** Detect if a URL/path points to an FBX file */
export function isFbxUrl(url: string): boolean {
  return url.toLowerCase().endsWith('.fbx');
}

/**
 * Normalize Mixamo FBX animation track names.
 * Mixamo uses "mixamorig:Hips.position" format — strip prefix
 * so bones match RPM / standard humanoid skeletons ("Hips.position").
 */
export function normalizeMixamoTracks(clips: THREE.AnimationClip[]): THREE.AnimationClip[] {
  return clips.map((clip) => {
    const c = clip.clone();
    c.tracks = c.tracks.map((track) => {
      track.name = track.name.replace(/^mixamorig:/g, '');
      // Also handle nested prefix patterns like "mixamorig:mixamorig:"
      track.name = track.name.replace(/mixamorig:?/g, '');
      return track;
    });
    return c;
  });
}

/**
 * Rename bones in an FBX scene to strip "mixamorig:" prefix.
 * This makes FBX model bones compatible with GLB animations
 * that reference bare bone names (Hips, Spine, etc.).
 *
 * Normalizes both the scene graph node names AND skeleton bone references
 * (in case the skeleton caches separate bone object references).
 */
export function normalizeFbxBoneNames(object: THREE.Object3D): void {
  // Pass 1: rename all nodes in the scene graph
  object.traverse((child) => {
    if (child.name.includes('mixamorig')) {
      child.name = child.name.replace(/mixamorig:?/g, '');
    }
  });
  // Pass 2: also rename bones referenced by SkinnedMesh skeletons
  object.traverse((child) => {
    if ((child as THREE.SkinnedMesh).isSkinnedMesh) {
      const mesh = child as THREE.SkinnedMesh;
      if (mesh.skeleton) {
        mesh.skeleton.bones.forEach((bone) => {
          if (bone.name.includes('mixamorig')) {
            bone.name = bone.name.replace(/mixamorig:?/g, '');
          }
        });
      }
    }
  });
}

/**
 * Auto-detect and normalize FBX scale.
 * Mixamo exports in centimeters (1 unit = 1cm), while GLB uses meters.
 * If the model bounding box height > 50 units, scale down to meters.
 */
export function normalizeFbxScale(object: THREE.Object3D): void {
  const bbox = new THREE.Box3().setFromObject(object);
  const height = bbox.max.y - bbox.min.y;
  if (height > 50) {
    object.scale.setScalar(0.01);
  }
}
