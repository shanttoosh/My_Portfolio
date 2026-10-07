"""
Combine a Mixamo character and its animation FBX files into one GLB with one clip per animation.

Usage:
  blender -b -P scripts/blender/combine_mixamo.py -- <folder-with-fbx-files> <output.glb>

The folder must contain character.fbx (With Skin) and any number of animation FBX files (Without Skin).
Each animation becomes a clip named after its file, e.g. "Typing.fbx" -> "Typing".
"""

import os
import sys

import bpy


def main() -> None:
    argv = sys.argv[sys.argv.index("--") + 1 :] if "--" in sys.argv else []
    if len(argv) != 2:
        raise SystemExit("usage: blender -b -P combine_mixamo.py -- <fbx-folder> <output.glb>")
    src, out = argv
    base = os.path.join(src, "character.fbx")
    if not os.path.isfile(base):
        raise SystemExit(f"missing {base}")

    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.fbx(filepath=base)
    armature = next(o for o in bpy.context.scene.objects if o.type == "ARMATURE")
    armature.animation_data_create()

    for action in list(bpy.data.actions):
        bpy.data.actions.remove(action)

    names = sorted(f for f in os.listdir(src) if f.lower().endswith(".fbx") and f.lower() != "character.fbx")
    for filename in names:
        clip = os.path.splitext(filename)[0]
        before = set(bpy.data.actions)
        existing = set(bpy.context.scene.objects)
        bpy.ops.import_scene.fbx(filepath=os.path.join(src, filename))
        for obj in set(bpy.context.scene.objects) - existing:
            bpy.data.objects.remove(obj, do_unlink=True)
        for action in set(bpy.data.actions) - before:
            action.name = clip
            action.use_fake_user = True
            track = armature.animation_data.nla_tracks.new()
            track.name = clip
            track.strips.new(clip, int(action.frame_range[0]), action)
            track.mute = True
            print(f"added clip {clip}")

    armature.animation_data.action = None
    os.makedirs(os.path.dirname(os.path.abspath(out)), exist_ok=True)
    bpy.ops.export_scene.gltf(
        filepath=out,
        export_format="GLB",
        export_animations=True,
        export_animation_mode="NLA_TRACKS",
        export_skins=True,
        export_morph=True,
    )
    print(f"wrote {out} with {len(names)} clips")


main()
