# Exact finite exploration. Run via minimal_index.py, not as a theorem prover.
NCJsonString := function(s)
    Print("\"", ReplacedString(ReplacedString(s, "\\", "\\\\"), "\"", "\\\""), "\"");
end;

RunMinimalIndex := function(bound)
    local reps, repids, n, count, i, db, g, j, iso, match, fresh,
          simpleCount, newCount, h, images, checked, pair;
    if LoadPackage("primgrp") = fail then Error("PrimGrp unavailable"); fi;
    reps := []; repids := []; checked := 0;
    Print("{\"type\":\"meta\",\"gap\":"); NCJsonString(GAPInfo.Version);
    Print(",\"primgrp\":"); NCJsonString(PackageInfo("primgrp")[1].Version);
    Print(",\"bound\":", bound, "}\n");
    for n in [2..bound] do
        if not PrimitiveGroupsAvailable(n) then Error("Missing degree ", n); fi;
        count := NrPrimitiveGroups(n); simpleCount := 0; newCount := 0;
        for i in [1..count] do
            db := PrimitiveGroup(n, i);
            # Rebuild, avoiding inherited library simplicity/size attributes.
            g := Group(GeneratorsOfGroup(db));
            if not IsTransitive(g, [1..n]) or not IsPrimitive(g, [1..n]) then
                Error("Invalid primitive library entry");
            fi;
            if IsSimpleGroup(g) then
                simpleCount := simpleCount + 1; match := fail;
                for j in [1..Length(reps)] do
                    # Size is only a filter. Equality is NEVER used as isomorphism.
                    if Size(g) = Size(reps[j]) then
                        checked := checked + 1;
                        iso := IsomorphismGroups(g, reps[j]);
                        if iso <> fail then
                            if not IsBijective(iso) or not IsGroupHomomorphism(iso) then
                                Error("Invalid isomorphism witness");
                            fi;
                            match := j; break;
                        fi;
                    fi;
                od;
                fresh := match = fail;
                if fresh then
                    Add(reps, g); Add(repids, [n, i]);
                    match := Length(reps); newCount := newCount + 1;
                fi;
                h := Stabilizer(g, 1);
                if Index(g,h) <> n then Error("Wrong stabilizer index"); fi;
                images := List(GeneratorsOfGroup(g), x -> List([1..n], p -> p^x));
                Print("{\"type\":\"simple\",\"degree\":", n,
                      ",\"id\":", i, ",\"order\":", Size(g), ",\"label\":");
                NCJsonString(StructureDescription(g));
                Print(",\"first\":", repids[match], ",\"new\":", fresh,
                      ",\"stabilizer_order\":", Size(h), ",\"generators\":", images, "}\n");
            fi;
        od;
        Print("{\"type\":\"degree\",\"degree\":", n, ",\"primitive_count\":", count,
              ",\"simple_actions\":", simpleCount, ",\"new_classes\":", newCount, "}\n");
    od;
    Print("{\"type\":\"done\",\"classes\":", Length(reps),
          ",\"isomorphism_calls\":", checked, "}\n");
end;
