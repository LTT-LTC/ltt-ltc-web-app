"use client"

import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/src/@core/utils/cn"
import { LTTDialog, LTTDialogContent, LTTDialogTitle } from "@/src/@core/component/LTTShadcnUI/LTTDialog"

const LTTCommand = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
    <CommandPrimitive
        ref={ref}
        className={cn(
            "flex h-full w-full flex-col overflow-hidden rounded-md bg-popover bg-white dark:bg-slate-950 text-popover-foreground",
            className
        )}
        {...props}
    />
))
LTTCommand.displayName = CommandPrimitive.displayName

interface CommandDialogProps extends DialogProps {
    title?: string
}

const LTTCommandDialog = ({ children, title = "Command Menu", ...props }: CommandDialogProps) => {
    return (
        <LTTDialog {...props}>
            <LTTDialogContent className="overflow-hidden p-0 shadow-lg">
                <LTTDialogTitle className="sr-only">{title}</LTTDialogTitle>
                <LTTCommand className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground-shadcn [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5">
                    {children}
                </LTTCommand>
            </LTTDialogContent>
        </LTTDialog>
    )
}

const LTTCommandInput = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Input>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
    <div className="flex items-center border-b border-border-shadcn px-3" cmdk-input-wrapper="">
        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
        <CommandPrimitive.Input
            ref={ref}
            className={cn(
                "flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground-shadcn disabled:cursor-not-allowed disabled:opacity-50",
                className
            )}
            {...props}
        />
    </div>
))
LTTCommandInput.displayName = CommandPrimitive.Input.displayName

const LTTCommandList = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.List>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.List
        ref={ref}
        className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
        {...props}
    />
))
LTTCommandList.displayName = CommandPrimitive.List.displayName

const LTTCommandEmpty = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Empty>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
    <CommandPrimitive.Empty
        ref={ref}
        className="py-6 text-center text-sm"
        {...props}
    />
))
LTTCommandEmpty.displayName = CommandPrimitive.Empty.displayName

const LTTCommandGroup = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Group>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Group
        ref={ref}
        className={cn(
            "overflow-hidden p-1 text-foreground-shadcn [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground-shadcn",
            className
        )}
        {...props}
    />
))
LTTCommandGroup.displayName = CommandPrimitive.Group.displayName

const LTTCommandSeparator = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Separator>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Separator
        ref={ref}
        className={cn("-mx-1 h-px bg-border-shadcn", className)}
        {...props}
    />
))
LTTCommandSeparator.displayName = CommandPrimitive.Separator.displayName

const LTTCommandItem = React.forwardRef<
    React.ElementRef<typeof CommandPrimitive.Item>,
    React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
    <CommandPrimitive.Item
        ref={ref}
        className={cn(
            "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none aria-selected:bg-accent-shadcn aria-selected:text-accent-shadcn-foreground data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
            className
        )}
        {...props}
    />
))
LTTCommandItem.displayName = CommandPrimitive.Item.displayName

const LTTCommandShortcut = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
    return (
        <span
            className={cn(
                "ml-auto text-xs tracking-widest text-muted-foreground-shadcn",
                className
            )}
            {...props}
        />
    )
}
LTTCommandShortcut.displayName = "LTTCommandShortcut"

export {
    LTTCommand,
    LTTCommandDialog,
    LTTCommandInput,
    LTTCommandList,
    LTTCommandEmpty,
    LTTCommandGroup,
    LTTCommandItem,
    LTTCommandShortcut,
    LTTCommandSeparator,
}
